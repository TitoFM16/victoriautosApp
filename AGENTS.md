# AGENTS.md

## Scope and precedence

These instructions apply to the whole Victoria Autos monorepo. Work under
`backend/` must also follow `backend/AGENTS.md`; that more specific file takes
precedence if its guidance differs from this file.

## Project overview

Victoria Autos is a vehicle dealership platform with two independent projects:

- `frontend/`: React 18, Vite, Redux Toolkit, React Router, Bootstrap/Sass, and Yarn.
- `backend/`: Python 3.13, FastAPI, Pydantic, async SQLAlchemy, PostgreSQL, Alembic,
  pytest, Ruff, and uv.

There is no root build system or shared dependency manager. Run commands from the
project directory they belong to. Read the root README and the relevant project's
README before changing behavior.

## Common commands

Frontend commands (run from `frontend/`):

```bash
yarn install
yarn dev
yarn lint
yarn build
yarn preview
```

Backend commands (run from `backend/`):

```bash
uv sync
docker compose up -d
uv run alembic upgrade head
uv run victoriautos-backend
uv run pytest
uv run ruff check .
uv run ruff format --check .
```

The frontend development proxy expects the backend at `http://localhost:3005`.
`uv run victoriautos-backend` uses that port; `uv run fastapi dev
src/victoriautos_backend/main.py` defaults to port 8000 unless configured otherwise.

## Repository conventions

- Use Yarn in `frontend/` and preserve `yarn.lock`; do not introduce npm, pnpm, or a
  second JavaScript lockfile.
- Use uv in `backend/` and preserve `uv.lock`; do not install backend dependencies
  with pip unless a task explicitly requires it.
- Keep changes focused. Preserve unrelated working-tree edits and avoid broad
  formatting or refactoring during targeted work.
- Follow the style already used in nearby files. Frontend code is JavaScript/JSX,
  not TypeScript; do not introduce a parallel abstraction without a concrete need.
- Put reusable UI in `frontend/src/components/shared/`, route definitions in
  `frontend/src/routes/`, API/helper code in `frontend/src/services/`, Redux state in
  `frontend/src/redux/`, and static source assets in `frontend/src/assets/`.
- Reuse the existing Redux, routing, Bootstrap/Sass, and component patterns before
  adding a new library. Keep public pages responsive and preserve admin-route
  protection and analytics exclusions.
- Treat `/api` and `/images` as backend-owned paths. Keep frontend requests relative
  when they are intended to pass through the Vite proxy.
- When an API contract changes, update backend schemas/routes/tests and every
  affected frontend caller in the same change. Preserve snake_case payloads and do
  not expose private vehicle fields or customer PII through public endpoints.
- Never commit `.env` files, credentials, tokens, real customer data, uploaded
  images, database dumps, build output, or dependency directories. Update the
  relevant `.env.example` when adding configuration.
- Do not edit generated output such as `frontend/dist/`. Make source changes and
  regenerate only when explicitly requested.
- Persistent backend schema changes require an Alembic migration. Follow all
  backend-specific architecture, security, migration, and testing rules in
  `backend/AGENTS.md`.

## Validation expectations

- Frontend-only changes: run `yarn lint` and `yarn build`. There is currently no
  frontend test script, so do not claim frontend tests passed.
- Backend-only changes: run focused pytest tests while iterating, then `uv run
  pytest`, `uv run ruff check .`, and `uv run ruff format --check .` when practical.
- Cross-stack changes: perform both sets of checks and manually verify the request
  and response shape at the integration boundary.
- Add or update automated tests for backend behavior changes. If frontend tests are
  introduced later, add tests for changed UI logic using the established framework.
- Report commands actually run and any failures or environmental limitations. The
  backend test suite requires the real PostgreSQL test database and may not be
  reported as passing when that database was unavailable.

## Safety and change discipline

- Inspect `git status` before and after edits. Do not discard, overwrite, or commit
  unrelated user changes.
- Do not run destructive database, migration, Docker-volume, or filesystem commands
  unless the user explicitly requests them and the exact target has been verified.
- Mock external integrations in tests, including reCAPTCHA, SIMIT, and Fasecolda;
  automated tests must not contact real paid or production services.
- Preserve existing public behavior unless the task explicitly changes it. Update
  the relevant README when setup instructions, ports, configuration, or a documented
  API contract changes.
