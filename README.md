# Data platform UI

The current frontend uses Vite, React, TypeScript, and Bun.

## Develop with all repositories

Create a GitHub Codespace from **khalidrazaa/be-fastapi-dp**, then follow that
repository's `docs/codespaces.md` guide. Its setup clones this repository and
`packages-dp` beside the backend. Open `data-plateform.code-workspace` from the
backend to work on all three together.

## Run this frontend

```bash
bun install --frozen-lockfile
bun run dev
```

The development server listens on `0.0.0.0:3000` with a fixed port. In Codespaces,
open forwarded port **3000**. The exact Codespaces hostname is allowed
automatically; the existing `DISABLE_HMR` switch is preserved.

Requests to `/api/...` are proxied to `http://127.0.0.1:8000/api/...` during
development. Run the backend on port 8000 once it has been implemented. The
current UI uses local/mock data and has no live backend integration yet.

```bash
bun run build
bun run lint
```

Use Codespaces secrets or ignored local environment files for credentials.
