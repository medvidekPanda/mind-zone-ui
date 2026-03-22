# Migrace na nginx proxy

Nahrazení custom Node.js proxy (`proxy/proxy-server.mts`) za nginx kontejner. Angular SSR poběží jako samostatný kontejner.

## Cílová architektura

```
[Browser] → [nginx :80] ─── /api/* ──→ [API backend]
                         ─── static ──→ (nginx servíruje přímo z buildu)
                         ─── /* ──────→ [Angular SSR :4200]
```

3 kontejnery: **nginx**, **Angular SSR**, **API backend**

## Proč

- Security headers, rate limiting, compression — nginx out of the box
- Škálování SSR instancí přes `docker compose scale angular-ssr=N`
- Žádný custom Node.js proxy kód k údržbě
- Statické soubory servíruje nginx (rychlejší než Node.js)
- API port nemusí být vystavený veřejně
- Řeší většinu bodů ze [SECURITY-ROADMAP.md](SECURITY-ROADMAP.md)

## TODO

- [ ] Vytvořit `nginx/nginx.conf` — upstreamy, security headers, rate limiting, gzip, caching
- [ ] Vytvořit `Dockerfile.nginx` — `FROM nginx:alpine`, kopie browser dist + nginx config
- [ ] Zjednodušit `Dockerfile` — jen Angular SSR, odebrat proxy, `NODE_ENV=production`, `USER node`
- [ ] Přidat `/_health` endpoint do `src/server.ts` pro container health checks
- [ ] Vytvořit `docker-compose.yml` — nginx + angular-ssr + napojení na API
- [ ] Smazat `proxy/proxy-server.mts`

## Poznámka k Angular SSR

`src/server.ts` si ponechá vlastní `/api` proxy — je potřebný pro SSR rendering (Angular HttpClient volá `/api` během server-side renderingu). Nginx předřadí static files a API proxy, takže SSR server dostane jen requesty vyžadující rendering.
