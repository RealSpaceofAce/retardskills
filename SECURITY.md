# Security notes

This repo publishes the skill packs from `public/`. Treat anything in that
directory as public internet content.

## Guardrails

- Do not commit `.env*`, Vercel project metadata, build output, preview files,
  private keys, or local absolute paths.
- Keep real values out of docs; use `.env.example` for variable names only.
- New access tokens are opaque and signed; they must not encode subscriber PII.
- Admin redirects must use local paths only.
- Run `npm run security:scan` before publishing changes.

## Scan coverage

- `gitleaks git` scans committed history.
- `gitleaks dir` scans the current working tree while ignoring generated
  artifacts listed in `.gitleaks.toml`.
- `semgrep p/default` scans tracked source.
- `npm audit --audit-level=moderate` checks dependency advisories.
