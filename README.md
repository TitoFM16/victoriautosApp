# Victoria Autos

Monorepo for the Victoria Autos vehicle dealership platform. Two independent
projects, each with its own tooling and history — see each folder's own README.

- [`backend/`](backend/README.md) — FastAPI (Python 3.13, uv, SQLAlchemy/Postgres,
  Alembic). See also [`backend/AGENTS.md`](backend/AGENTS.md) and
  [`backend/docs/hosting-and-storage-decision.md`](backend/docs/hosting-and-storage-decision.md).
- [`frontend/`](frontend/README.md) — React + Vite, package-managed with **yarn**
  (`yarn.lock` present, not npm).

There is no shared build tool (no turborepo/nx) — the two sides talk over HTTP,
not a shared toolchain, so each folder is built/run/tested independently with
its own package manager.
