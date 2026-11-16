# Data platform UI

The frontend uses Next.js App Router, React, TypeScript, Tailwind CSS, and Bun.
The existing explorer, detail panels, catalog, warehouse, profiling views, and
actions remain interactive React components with the same visual design.
The server layout and page use App Router; `src/app/workspace.tsx` intentionally
loads the interactive workspace only in the browser to preserve local dates and
state behavior. Server-rendered API features can be adopted gradually.

Use Node.js **20.9 or newer** and Bun to install dependencies and run the scripts.

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

The development server listens on `0.0.0.0:3000`. In Codespaces, open forwarded
port **3000**. The current Codespaces origin is allowed automatically.
Optionally set `DISABLE_HMR=true` to disable development file watching through
the webpack configuration. Restart the server to pick up source changes when
this compatibility switch is enabled.

The UI currently uses local/mock data. Upload parsing, folder/file actions,
profiling, and ingestion simulations preserve their existing behavior; changing
the frontend framework does not connect these workflows to live services.

Next.js rewrites requests from `/api/...` to the FastAPI backend while preserving
the `/api` prefix. The default backend is `http://127.0.0.1:8000`, so a request to
`/api/files` is forwarded to `http://127.0.0.1:8000/api/files`. This works in
development and when running the production Next.js server.

Copy `.env.example` to `.env.local` to override `FASTAPI_URL` with the backend's
origin. `FASTAPI_URL` is a server-only setting; do not prefix it with
`NEXT_PUBLIC_`. Restart the development server or rebuild the production app
after changing it.

```bash
bun run build
bun run start
bun run lint
```

`build` creates the production app, `start` serves that build on
`0.0.0.0:3000`, and `lint` checks TypeScript without emitting files.

Use Codespaces secrets or ignored local environment files for credentials.

## Platform responsibilities

- **ui-nextjs-dp:** the application interface, navigation, and interactions.
- **be-fastapi-dp:** the planned API, authentication, cloud-storage operations,
  PostgreSQL metadata catalog, and ingestion/profiling orchestration.
- **packages-dp:** shared Python libraries, DAG definitions, and supporting
  utilities for backend and pipeline logic once the package is implemented.
- **Apache Superset:** the planned BI dashboards over prepared reporting data.

The backend, shared Python package, and Superset integrations are future work;
the current frontend remains a working mock of those workflows.
