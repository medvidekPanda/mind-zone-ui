# Mind Zone Security Architecture

Summary of security principles for an application handling sensitive (therapeutic) data.

---

## 1. Authentication — Session-Based Instead of Frontend Token

### Problem

Firebase Auth SDK runs in the browser. The token (JWT) is accessible in the JS context — an XSS attack can exfiltrate it and gain full API access.

### Solution — Server-Side Session

The frontend never sees the token. Instead:

1. **Login** — frontend sends credentials to the API (`POST /api/auth/login`), server verifies via Firebase Admin SDK, creates a server-side session, and returns a `Set-Cookie` with an HttpOnly cookie.
2. **Every request** — the browser automatically sends the cookie, server looks up the session and resolves the userId.
3. **Logout** — `POST /api/auth/logout`, server deletes the session.

```
┌─────────┐     cookie (sessionId)      ┌─────────┐    userId from session  ┌──────────┐
│ Browser  │ <─────────────────────────> │   API   │ <───────────────────> │ Firebase │
│          │   HttpOnly, Secure, Strict  │ Server  │   Admin SDK (server)  │  Admin   │
└─────────┘                              └─────────┘                       └──────────┘
```

### Cookie Flags

- `HttpOnly` — JS cannot access it, XSS cannot read it
- `Secure` — HTTPS only
- `SameSite=Strict` — not sent from cross-origin requests
- `Path=/api` — not sent to other paths

### Backend Requirements

- **Session store** — Redis or DB table (sessionId -> userId + expiry)
- **Session middleware** — reads cookie instead of verifying Bearer token
- **CSRF protection** — server generates a CSRF token, frontend sends it in the `X-CSRF-Token` header
- **Idle timeout** — session expires after inactivity (e.g. 30 min)
- **Absolute timeout** — expires even during activity (e.g. 8h, forces re-login)
- **Invalidation** — immediately invalidate session on logout, password change, or suspicious activity

### Additional Measures

- **CSP headers** — restrict where scripts can be loaded from, significantly mitigate XSS:
  ```
  Content-Security-Policy:
    default-src 'self';
    script-src 'self';
    connect-src 'self' https://api.mindzone.cz;
    frame-ancestors 'none';
  ```
- **Rate limiting** — detect unusual request volume from a single session
- **Audit log** — who accessed what and when

### Comparison

|                          | JWT on frontend | Server session + HttpOnly cookie |
|--------------------------|-----------------|----------------------------------|
| XSS token exfiltration   | possible        | impossible                       |
| Server-side invalidation | not possible (until expiry) | immediate              |
| Scalability              | stateless       | requires session store           |
| CSRF risk                | none            | requires protection              |
| Infrastructure           | simpler         | Redis/DB for sessions            |

---

## 2. Data Encryption

### Encryption Types

| Type                 | Who encrypts    | Server sees data | Server functionality | Complexity |
|----------------------|-----------------|-------------------|----------------------|------------|
| Server-side          | Server          | Yes               | Full                 | Low        |
| E2E (full)           | Client          | No                | Minimal              | Very high  |
| Hybrid               | Client + Server | Partially         | Preserved            | Medium     |

### Hybrid Approach (Recommended)

Sensitive fields are encrypted by the client (browser), non-sensitive fields remain readable for the server:

```
Browser                    Server/DB
──────────────────────────────────────────
"Jan Novak"  ──HTTPS──>   firstName: "Jan Novak"      <- readable
"active"     ──HTTPS──>   status: "active"             <- readable
"Patient     ──AES───>    notes: "x8f2k...u9d3"       <- unreadable blob
 suffers..."               (server cannot see contents)
```

**Non-sensitive fields (plaintext):** id, status, created_at, therapist_id — server can filter, sort, paginate.

**Sensitive fields (E2E encrypted):** therapy notes, diagnoses, session records — server never sees the content.

### Encryption in Practice (Web Crypto API)

```typescript
// Derive key from password
const keyMaterial = await crypto.subtle.importKey(
  'raw', new TextEncoder().encode(userPassword), 'PBKDF2', false, ['deriveKey']
);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 600000, hash: 'SHA-256' },
  keyMaterial,
  { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
);

// Encrypt
const iv = crypto.getRandomValues(new Uint8Array(12));
const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(data))
);
```

### DB Schema for Encrypted Data

```sql
CREATE TABLE clients (
  id VARCHAR(36) PRIMARY KEY,
  owner_id VARCHAR(36) NOT NULL,
  first_name VARCHAR(100),              -- plaintext, for searching
  status VARCHAR(20),                   -- plaintext, for filtering
  encrypted_data MEDIUMBLOB NOT NULL,   -- encrypted JSON (notes, diagnoses)
  iv BINARY(12) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### E2E Encryption Caveats

- **Lost key = lost data** — solution: recovery key generated at registration
- **Server cannot filter/sort** encrypted fields — hence the hybrid approach
- **Sharing between users** — requires asymmetric cryptography (RSA/ECDH keypair)
- **Password change** — separate master key from password; password change = re-encrypt only the master key, not all data

---

## 3. LLM Integration and Anonymization

### Two-Tier Architecture

```
Local LLM (full data)              External LLM (anonymized data)
──────────────────────────         ───────────────────────────────────
"Jan Novak, 34 years old,          "Client_a7x9, 34 years old,
 suffers from anxiety               suffers from anxiety
 after divorce"                      after divorce"

 -> fast, full control               -> better analysis quality
 -> lower model quality              -> temporary ID, no link to person
```

### Principles

- **Local LLM as default** — data never leaves the infrastructure, full data including identification
- **External LLM for better analysis** — only with anonymization
- **Anonymization** — remove identifying information, replace with temporary ID
- **Temporary ID** — mapping `temporary ID -> real client` exists only in memory for the duration of the request, discarded after processing
- **Explicit consent** from therapist/client before any LLM processing

### Self-Hosted LLM

- Open-source models (Llama, Mistral) on own infrastructure
- Data never leaves the controlled environment
- Downside: GPU costs, lower quality compared to commercial models

---

## Summary of Recommendations

1. **Session-based auth** with HttpOnly cookies (eliminates XSS token exfiltration)
2. **CSP headers** (mitigate XSS)
3. **CSRF tokens** (required complement to cookies)
4. **Hybrid encryption** — non-sensitive metadata in plaintext, clinical records E2E encrypted
5. **Local LLM** as default, external with anonymization
6. **Audit logging** — who accessed what data and when
7. **Session invalidation** on password change / suspicious activity
