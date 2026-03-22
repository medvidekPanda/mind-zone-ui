# Security Roadmap

Bezpečnostní audit proxy serveru a SSR konfigurace. Tento dokument slouží jako roadmapa pro budoucí vylepšení.

**Dotčené soubory:**
- `proxy/proxy-server.mts` — hlavní reverse proxy
- `src/server.ts` — Angular SSR server
- `Dockerfile` — kontejner konfigurace
- `.dockerignore` — Docker ignore pravidla

---

## Kritické (řešit co nejdříve)

### Chybí security headers
Žádný Helmet.js ani manuální security headers. Chybí:
- `Content-Security-Policy` (CSP)
- `X-Frame-Options` (clickjacking)
- `X-Content-Type-Options` (MIME sniffing)
- `Strict-Transport-Security` (HSTS)
- `Referrer-Policy`

**Řešení:** Přidat `helmet` middleware do `proxy/proxy-server.mts`.

```bash
npm install helmet
```
```typescript
import helmet from "helmet";
app.use(helmet());
```

### Žádný rate limiting
Proxy nemá žádnou ochranu proti DDoS nebo brute force útokům.

**Řešení:** Přidat `express-rate-limit`.

```bash
npm install express-rate-limit
```
```typescript
import rateLimit from "express-rate-limit";
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

### Health endpoint leakuje interní info
`/_health` vrací `apiUrl`, `ports`, `instances` — útočník získá info o infrastruktuře.

**Řešení:** Vrátit pouze `{ status: "ok" }`, nebo endpoint chránit autorizací.

### `dotfiles: "allow"` ve static serving
`proxy/proxy-server.mts:97` — může vystavit `.env`, `.git` a další citlivé soubory.

**Řešení:** Změnit na `dotfiles: "deny"`.

---

## Vysoká priorita

### Žádné CORS omezení
Chybí explicitní whitelist povolených originů. Jakýkoliv origin může posílat requesty.

**Řešení:** Přidat `cors` middleware s explicitním seznamem originů.

### Chybí request/response size limity
Žádný limit na velikost těla requestu — riziko memory exhaustion.

**Řešení:** Nastavit `express.json({ limit: '1mb' })` a podobně pro další parsery.

### NODE_ENV=development v Dockerfile
`Dockerfile:26` — produkční kontejner běží v dev módu, což zapíná verbose logging a vypíná optimalizace.

**Řešení:** Změnit na `ENV NODE_ENV=production`.

### Docker běží jako root
Chybí `USER` direktiva — pokud je kontejner kompromitován, útočník má root přístup.

**Řešení:** Přidat do Dockerfile:
```dockerfile
RUN addgroup --system app && adduser --system --ingroup app app
USER app
```

---

## Střední priorita

### Chybí request timeout na SSR serveru
`src/server.ts` nemá žádný timeout — riziko hanging connections a resource exhaustion.

**Řešení:** Nastavit `server.timeout` a `server.keepAliveTimeout`.

### HTTP default pro API_URL
Interní komunikace proxy → API běží přes nešifrovaný HTTP.

**Řešení:** V Docker network to může být akceptovatelné, ale pro produkci mimo Docker zvážit HTTPS.

### `.dockerignore` neexkluduje `.env*`
Citlivé soubory by mohly být zkopírovány do Docker image.

**Řešení:** Přidat do `.dockerignore`:
```
.env*
*.pem
*.key
```

### Chybí Content-Security-Policy
Žádná CSP hlavička — zvyšuje riziko XSS útoků.

**Řešení:** Nakonfigurovat CSP přes Helmet nebo vlastní middleware.

---

## Nízká priorita

### Žádné request ID tracking
Chybí X-Request-ID header — ztěžuje debug a audit bezpečnostních incidentů.

### Chybí Permissions-Policy header
Formerly Feature-Policy — kontroluje přístup k browser APIs (kamera, mikrofon, geolokace).

### SSR server nemá graceful shutdown
`src/server.ts` nemá SIGTERM/SIGINT handlery — in-flight requesty mohou být ztraceny.

---

## Plánovaná architekturální změna

Většina výše uvedených problémů se vyřeší přechodem na nginx proxy. Detailní plán viz **[NGINX-MIGRATION.md](NGINX-MIGRATION.md)**.

---

## Poznámky

**Firebase client config (API key, projectId) NENÍ bezpečnostní problém.** Tyto hodnoty jsou designově veřejné a viditelné v browser bundle. Bezpečnost zajišťují Firebase Security Rules na backendu.
