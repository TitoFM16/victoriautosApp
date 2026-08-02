# AGENTS.md

## Project overview

Victoria Autos Backend is an API-only vehicle dealership service built with Python
3.13, FastAPI, Pydantic, async SQLAlchemy 2.0, PostgreSQL, and Alembic. Source code
lives under `src/victoriautos_backend`; tests use pytest, HTTPX's ASGI transport,
and a real PostgreSQL test database.

Read `README.md` before changing API behavior. It documents the endpoint contract,
authentication model, migration decisions, and deliberate differences from the
legacy Node service.

## Common commands

```bash
uv sync
docker compose up -d
uv run alembic upgrade head
uv run fastapi dev src/victoriautos_backend/main.py
uv run pytest
uv run ruff check .
uv run ruff format --check .
uv run pre-commit run --all-files
```

The bundled PostgreSQL server is exposed on `localhost:5433` and initializes both
`victoriautos` and `victoriautos_test`. Tests require a running PostgreSQL instance.
Use `TEST_DATABASE_URL` when the default derived test URL is unsuitable. Never point
tests at a database containing data that must be preserved: the suite creates,
truncates, and drops tables.

## Architecture and conventions

- Keep route handlers async. Use `DbSession`, `CurrentUser`, and `AdminUser` aliases
  from `api/deps.py` instead of duplicating dependency declarations.
- Register new routers in `src/victoriautos_backend/main.py`.
- Keep API payloads in snake_case and define explicit Pydantic request/response
  schemas. Use `ORMModel` for schemas returned from ORM objects.
- Preserve the public/admin schema boundary. Public vehicle responses must not expose
  `placa`, VIN, chassis, motor, or importation fields.
- Protect all back-office, PII-listing, and mutation endpoints with `AdminUser` unless
  the documented API explicitly makes the operation public.
- Use SQLAlchemy 2.0-style statements and the async session API. Commit intentional
  mutations and refresh ORM instances when database-generated state is returned.
- Models belong in `models/`, API schemas in `schemas/`, HTTP routing in
  `api/routers/`, and non-HTTP business or integration logic in `services/`.
- Import new model modules from `models/__init__.py` so `Base.metadata`, Alembic, and
  tests discover them.
- Any persistent schema change requires an Alembic revision under
  `migrations/versions/`. Inspect generated migrations and verify both upgrade and
  downgrade paths; do not rely on `Base.metadata.create_all()` for production schema
  changes.
- UUIDs are the normal primary keys. Car and offer UUIDs also identify their image
  directories, so filesystem and database behavior must remain consistent.
- Uploaded images are converted to WEBP. Keep resolved-path containment checks and
  clean up image directories when their owning record is deleted.
- Configuration belongs in `core/config.py` and environment variables. Update
  `.env.example` for new settings, but never commit `.env`, credentials, tokens, real
  customer data, or generated uploads.
- Follow Ruff's 100-character line length and Python 3.13 typing conventions.

## Testing expectations

- Add or update tests for every behavior change. Prefer endpoint-level async tests
  using the existing `client`, `admin_client`, and `db_session` fixtures.
- Tests use a real PostgreSQL database; do not replace ORM behavior with mocks.
- Keep unauthenticated and admin clients separate when testing access controls.
- External services such as reCAPTCHA, SIMIT, and Fasecolda must be mocked. Tests
  must never make real network calls. Use `bypass_recaptcha` where appropriate.
- Assert both successful behavior and important boundaries: validation failures,
  401/403 authorization, 404 handling, sensitive-field exclusion, and persistence.
- Run the focused test file while iterating, then run `uv run pytest` and Ruff before
  handing off a change. If PostgreSQL is unavailable, report that limitation rather
  than claiming the full suite passed.

## Change discipline

- Preserve existing API behavior unless the task explicitly changes the contract.
  If a contract changes, update `README.md` alongside code and tests.
- Avoid broad refactors during targeted fixes and do not edit generated migration
  history unrelated to the change.
- Check the working tree before editing and preserve unrelated user changes.
- Do not perform destructive database or Docker volume operations unless explicitly
  requested.
