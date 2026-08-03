# Victoria Autos Backend

FastAPI backend for the Victoria Autos vehicle dealership platform: public vehicle
listings, lead-capture forms (buy/sell/offer interest), an admin back office for
inventory and forms management, PDF contract generation, and plate lookups
(SIMIT/Fasecolda).

This is a from-scratch migration of the original Express/Mongoose/Postgres backend
(`victoriautosServer`) to FastAPI + PostgreSQL + SQLAlchemy. It is **API-only** - the
React frontend is deployed separately (see [Breaking changes](#breaking-changes-from-the-old-api)).

## Tech Stack

- **Runtime:** Python 3.13
- **Framework:** FastAPI (async)
- **Database:** PostgreSQL only, via SQLAlchemy 2.0 (async, `asyncpg` driver) + Alembic migrations
- **Auth:** Stateless JWT in an httpOnly cookie, password hashing via Argon2 (`pwdlib`)
- **Image processing:** Pillow (WEBP conversion)
- **PDF generation:** pypdf (fills the same contract template as the original)
- **Package/venv management:** [uv](https://docs.astral.sh/uv/)
- **Linting/formatting:** [ruff](https://docs.astral.sh/ruff/), enforced via pre-commit
- **Tests:** pytest + pytest-asyncio + httpx's ASGI transport, run against a real Postgres test DB
- **Rate limiting:** slowapi, on login/signup and every public lead-capture endpoint
- **Containerization:** multi-stage Dockerfile (built on uv) + docker-compose for local Postgres/full-stack testing

## Project Structure

```
victoriautosBackend/
├── src/victoriautos_backend/
│   ├── main.py              # FastAPI app factory, middleware, router registration
│   ├── core/                # settings, JWT/password security, logging
│   ├── db/                  # SQLAlchemy Base, async engine/session
│   ├── models/               # SQLAlchemy ORM models
│   ├── schemas/               # Pydantic request/response schemas
│   ├── services/              # image processing, PDF filling, reCAPTCHA, business logic
│   └── api/
│       ├── deps.py           # get_db, get_current_user, require_admin
│       └── routers/          # one module per resource
├── migrations/               # Alembic (async) migration environment + versions
├── scripts/                  # one-off admin/data scripts (create_admin.py, catalog migration)
├── templates/                # PDF contract template
├── tests/                    # pytest suite (real Postgres test DB, no mocked ORM)
├── data/images/               # uploaded vehicle/offer photos (gitignored, like the original)
├── docker/                   # docker-compose init scripts (test DB creation)
├── docker-compose.yml        # local Postgres + optional containerized app
├── Dockerfile                # multi-stage build for the app itself
├── docker-entrypoint.sh      # runs alembic upgrade head, then starts uvicorn
├── pyproject.toml
├── alembic.ini
└── .pre-commit-config.yaml
```

## Setup

Requires [uv](https://docs.astral.sh/uv/) and a PostgreSQL instance - either the
bundled `docker-compose.yml` (no local Postgres install needed) or your own.

### Option A: Docker Compose (recommended for local testing)

```bash
docker compose up -d          # starts Postgres on localhost:5433, creates
                               # both the `victoriautos` and `victoriautos_test` databases
uv sync                       # creates .venv, installs all dependencies
cp .env.example .env          # DATABASE_URL default already matches the compose service
uv run alembic upgrade head   # create all tables
uv run pre-commit install     # enable the git hooks (ruff check + format on commit)
```

Port 5433 (not 5432) is used so this doesn't clash with a Postgres already
running natively on your machine. `docker compose down` stops it;
`docker compose down -v` also wipes the data volume.

### Option B: your own PostgreSQL instance

```bash
uv sync
cp .env.example .env         # fill in DATABASE_URL, SECRET_KEY, RECAPTCHA_SECRET_KEY
createdb victoriautos        # or whatever database name you put in DATABASE_URL
createdb victoriautos_test   # used by the test suite
uv run alembic upgrade head  # create all tables
uv run pre-commit install    # enable the git hooks (ruff check + format on commit)
```

Generate a `SECRET_KEY` with:
```bash
uv run python -c "import secrets; print(secrets.token_urlsafe(64))"
```

## Running

```bash
uv run fastapi dev src/victoriautos_backend/main.py   # dev server with reload, port 8000
# or
uv run victoriautos-backend                            # runs on port 3005 (matches the original)
```

Interactive API docs are served at `/docs` (Swagger UI) and `/redoc`.

### Running the containerized app

`docker-compose.yml` also has an `app` service that builds and runs the API itself
from the `Dockerfile`, on top of the `postgres` service - useful for testing the
actual container image, as opposed to day-to-day development (where
`fastapi dev` with hot reload is faster):

```bash
docker compose up -d --build
```

This runs `alembic upgrade head` automatically on container start (see
`docker-entrypoint.sh`), then serves on `http://localhost:3005`. Change the `3005`
in `docker-compose.yml`'s `app.ports` if that's already taken locally. Uploaded
images persist in the `app_images` named volume across restarts.

Building the standalone image without compose:
```bash
docker build -t victoriautos-backend .
docker run -p 3005:8000 --env-file .env victoriautos-backend
```

## Rate limiting

Login, signup, and every public lead-capture endpoint (`/api/compra`,
`/api/interescompra`, `/api/ofertas`, `/api/vende`, plus `/api/buscaplaca` since it
proxies a paid external API) are rate-limited per client IP via
[slowapi](https://github.com/laurentS/slowapi) - 5/minute for login and signup,
10/minute for the rest. Exceeding the limit returns `429` with a JSON body like
`{"error": "Rate limit exceeded: 5 per 1 minute"}`.

This uses slowapi's default in-memory storage, so counters are per-process - fine
for a single worker/instance, but if this ever runs behind multiple uvicorn workers
or replicas, each one tracks its own count (the effective limit multiplies by
worker count). Switch to a Redis-backed store (`Limiter(..., storage_uri="redis://...")`
in `core/rate_limit.py`) if that becomes a real concern.

## Creating an admin user

There's no signup flow that grants admin - `POST /api/users/signup` always creates
a regular user - so bootstrap (or fix) an admin account with:

```bash
uv run python scripts/create_admin.py --username admin
# prompts for a password (hidden) if the user doesn't exist yet;
# if the user already exists, it's just promoted to admin.
```

## Testing

Tests run against a **real** Postgres database (no mocked ORM/session) - the schema
is created and dropped once per test session, and tables are truncated between
tests.

```bash
uv run pytest
```

By default the test DB URL is derived from `DATABASE_URL` in `.env` (same host/user,
database name `victoriautos_test`) - already created for you if you used the Docker
Compose setup above. Override with the `TEST_DATABASE_URL` env var if needed.
External calls (reCAPTCHA, SIMIT/Fasecolda) are mocked in tests - never hit real
network.

## Migrating catalog data from the old Postgres table

The old app kept a separate `vehiculos` reference table (tipo/marca/linea/version,
used by `/api/buscavehiculo`'s cascading dropdowns) in its own Postgres database.
If you have that data and want to carry it over:

```bash
uv run python scripts/migrate_vehicle_catalog.py --source "postgresql://user:pass@host:5432/vehiculos_db"
```

Safe to re-run - duplicate `(tipo, marca, linea, version)` combinations are skipped.

## Building a Colombian vehicle catalog

Source-preserving collectors can create normalized CSV inputs without changing the
production database:

```bash
# Fasecolda: process only an XLSX Victoriautos is authorized to store and use.
uv run python scripts/import_fasecolda_catalog.py \
  --source ~/Downloads/GuiaValores.xlsx \
  --output data/catalog/fasecolda.csv

# Datos Abiertos: discover every compatible dataset and query only aggregated fields.
uv run python scripts/collect_datos_abiertos_catalog.py \
  --output data/catalog/datos_abiertos_sources.csv \
  --merged-output data/catalog/datos_abiertos_merged.csv

# MinTransporte: nationwide official brand/line/year/value tables.
uv run python scripts/collect_mintransporte_catalog.py \
  --output data/catalog/mintransporte_sources.csv \
  --merged-output data/catalog/mintransporte_merged.csv

# Combine the nationwide reference and territorial market-presence sources.
uv run python scripts/merge_vehicle_catalog_exports.py \
  data/catalog/mintransporte_sources.csv \
  data/catalog/datos_abiertos_sources.csv \
  --output data/catalog/colombia_vehicle_catalog.csv
```

The Fasecolda helper never accesses or scrapes the website. Fasecolda's site-wide terms require
prior written authorization for reproducing or storing its content, so obtain permission before
using the local parser or publishing its output. The parser supports long-form workbooks and the
traditional XLSX/CSV formats where model years are price columns. A historical or authorized
source can be compared with MinTransporte using `scripts/compare_vehicle_catalogs.py`.

The Datos Abiertos collector searches the Socrata catalog using several Spanish vehicle terms,
keeps datasets containing brand, line/reference, and model year, and requests grouped values
through SODA. It never requests plate, VIN, owner, or full vehicle-level rows. Use `--list-only`
to review matching sources, `--include-dataset ID` to add a known source, and
`SOCRATA_APP_TOKEN` to supply an optional Socrata application token.

Outputs keep their source dataset ID and update date. Any product using them must display the
required attribution `Fuente: Portal de Datos Abiertos www.datos.gov.co` and the original update
date. Review source quality and aliases before importing the CSV into `vehiculos`: different
publishers use inconsistent brand/line spelling, registrations are not sales, and the current
table does not yet model year as part of its uniqueness constraint.

The MinTransporte collector downloads the official annual base-gravable XLSX tables linked from
the ministry's publication page. These are nationwide reference tables rather than territorial
registrations and include automobiles, pickups/camperos, double-cab pickups, electric vehicles,
motorcycles, passenger/cargo vehicles, ambulances, and hybrids. Values are published in thousands
of pesos and are normalized to COP. The grouped `2001 y anteriores` column is intentionally
excluded because it does not identify an exact model year.

There is no equivalent script for the MongoDB collections (cars, forms, users,
tramites, plate searches): that data model changed enough (new primary keys,
consolidated schema, Argon2 password hashing) that a straight copy isn't
meaningful. If you need to carry over real production data from Mongo, write a
one-off script following the same pattern, reviewed against the current schema
in `src/victoriautos_backend/models/`.

## Architecture decisions made during migration

These were explicitly chosen (not assumed) when porting from the Node app:

- **Single database.** The old app used MongoDB (Mongoose) for cars/forms/users/tramites
  *and* a separate PostgreSQL table for the vehicle catalog. Everything now lives in
  one PostgreSQL database with real foreign keys (e.g. `tramites.car_id -> cars.id`)
  instead of unenforced Mongoose refs.
- **Stateless JWT auth, no server-side sessions.** The old app ran Passport JWT
  *and* file-backed sessions side by side, but the session layer didn't actually gate
  anything except clearing cookies on logout. That's now just... clearing cookies on
  logout, without the session-file-store subsystem.
- **API-only.** The old app also served the built React frontend as static files with
  a catch-all SPA route. This repo is backend-only; the frontend is deployed
  separately.
- **Plate lookup (`/api/buscaplaca`) is mounted and active.** In the original it was
  fully implemented (`routes/buscaPlacaRouter.js`) but never wired into `app.js`.

## Bugs fixed during migration

- **PII leak: `GET /api/compra` had no auth check at all**, publicly exposing buyer
  name, phone, email, and national ID (`cedula`) for every pending purchase request.
  Now admin-only, like every analogous endpoint.
- **`GET /api/tramites` and `GET /api/tramites/{id}` had no auth check**, unlike every
  other admin resource (the old README already flagged this as "likely an oversight").
  Now admin-only.
- **Path traversal in image serving.** The old `/images/vehiculos/*` and
  `/images/ofertas/*` handlers joined the raw URL path directly into a filesystem
  path with no containment check. Fixed with an explicit resolved-path check.
- **Broken admin update whitelist.** `PUT /api/admin/cars` defined a field whitelist
  but was mounted on a path with no `:carId` param, so `req.params.carId` was always
  `undefined` and the handler was unreachable dead code. The *actual* working update
  endpoint (`PUT /api/admin/cars/:carId`) applied `$set: req.body` with **no**
  whitelist at all - any field could be overwritten. Consolidated into one
  `PUT /api/admin/cars/{car_id}` endpoint that enforces the intended whitelist.
- **Bulk-delete endpoints used `Model.remove({})`**, a Mongoose static removed in
  Mongoose 7+ - these would already throw at runtime against the `mongoose@^8` in
  `package.json`. Reimplemented as proper bulk deletes.
- **`SameSite=Strict` on the auth cookie** while the app's own CORS whitelist lists
  origins on different domains - `Strict` cookies aren't sent on cross-site requests
  at all, so authenticated calls from a separately-hosted frontend would have quietly
  failed after login. Now `SameSite=None; Secure` in production (`Lax` in local dev,
  where `None` would require HTTPS).
- **`Car.images` array defaulted to `''`** (an empty string) instead of `[]`. Fixed.
- **Dual identifiers.** `Car` and `OfertaForm` each had a Mongo `_id` *and* a separate
  `uuid` field used only for naming the image folder. Unified into a single UUID
  primary key that also names the folder.
- **Phone numbers and national ID stored as `Number`** (`celular`, `cedula`), which
  silently drops leading zeros and can't hold a `+57` prefix. Now stored as text.
- **`router.get('checkJWTToken', ...)`** was missing its leading `/`, so Express never
  matched it - dead code, not migrated (`check-auth-cookie` covers this).
- **`routes/recaptchaRouter.js`** was unreachable scratch code with a top-level
  `await` outside any function (a syntax-adjacent bug) - not migrated; the real
  reCAPTCHA logic (`middleware/captchaMiddleware.js`) was already separate and is
  what's ported here.
- **Password hashing** moved from `passport-local-mongoose`'s PBKDF2 scheme to
  Argon2id (current OWASP-recommended default). If you ever migrate real user
  accounts from the old database, existing password hashes are not compatible -
  those users will need a password reset.

## Breaking changes from the old API

The JSON contract is now consistent snake_case throughout - the old API mixed
`_id`, PascalCase (`Tipo`), camelCase (`wppCheck`, `simitResult`), and inconsistent
casing (`fechaInicio` vs `FechaFin`). A frontend integrating against this backend
needs to account for:

| Old | New |
|---|---|
| `_id` | `id` |
| `Tipo` (Car) | `tipo` |
| `wppCheck` | `wpp_check` |
| `fechaInicio` / `FechaFin` | `fecha_inicio` / `fecha_fin` |
| `simitResult` / `fasecoldaResult` | `simit_result` / `fasecolda_result` |
| `car` (id string on write, populated object on read) | `car_id` on write, `car` (nested object) on read |
| `__v` (Mongoose version key) | removed entirely |

Also: `/api/compra` and `/api/tramites` GET endpoints now require admin auth (see
[Bugs fixed](#bugs-fixed-during-migration) above) - any frontend code calling them
without credentials will start getting `401`.

## API Endpoints

All routes are mounted under `/api`, except `/images` which is mounted at the root.

### Auth & Authorization

- Login (`POST /api/users/login`) issues a JWT in an **httpOnly `token` cookie**.
- `get_current_user` (in `api/deps.py`) validates that cookie and loads the user.
- `require_admin` additionally requires `user.admin is True`, else `403`.
- Public read endpoints (browsing cars) and lead-capture form submissions require no auth.
- CORS is restricted to an explicit origin whitelist (`core/config.py`).

### `/api/cars` - public vehicle inventory

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/cars/` | none | List in-stock cars (`status=ALMACEN`). Query params: `limit`, `page`, `marca`, `linea`, `mobile=true` (first image only). |
| GET | `/api/cars/{car_id}` | none | Get one car. `403` if not `ALMACEN`. |

Sensitive fields (`placa`, `vin`, `chasis_no`, `motor_no`, `importacion_no`,
`importacion_date`) are excluded from this public schema.

### `/api/admin` - inventory & lead-matching back office (admin-only)

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/cars` | List all cars, any status. |
| POST | `/api/admin/cars` | Create a car. `multipart/form-data` + `car_images` files (converted to WEBP, stored under `data/images/vehiculos/<car_id>/`). |
| GET / PUT / DELETE | `/api/admin/cars/{car_id}` | Get / whitelisted partial update / delete (+ image folder). |
| DELETE | `/api/admin/cars` | Delete all cars (+ their image folders). |
| GET | `/api/admin/match` | Cross-references pending buy-interest leads against in-stock cars and pending sell-offers by `marca`/`linea`. |

### `/api/buscavehiculo` - vehicle catalog lookup (Postgres reference table)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/buscavehiculo/` | none | Cascading lookup: no params -> distinct `tipo`s; `?tipo=` -> distinct `marca`s (`tipo=all` for every marca); `?tipo=&marca=` -> distinct `linea`/`version` combos. |
| POST | `/api/buscavehiculo/marca` | admin | Add a new `marca` under a `tipo`. |
| POST | `/api/buscavehiculo/linea` | admin | Add a new `linea`/`version` under a `tipo`+`marca`. |

### `/api/vende` - "sell us your car", simple form

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/vende/` | admin | List all offer submissions. |
| POST | `/api/vende/` | none | Create an offer from a JSON body - no reCAPTCHA, no photos. |

### `/api/ofertas` - "sell us your car" with photos + reCAPTCHA

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/ofertas/` | admin | List offers with `status=PENDING`. |
| POST | `/api/ofertas/` | none (reCAPTCHA) | `multipart/form-data` + `car_images` files. |
| GET / PUT / DELETE | `/api/ofertas/{oferta_id}` | admin | Get / update / delete (+ image folder). |

### `/api/interescompra` - "looking to buy" lead form

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/interescompra/` | admin | List submissions with `status=PENDING`. |
| POST | `/api/interescompra/` | none (reCAPTCHA) | JSON body: contact info + desired `marca`/`linea`/`modelo`/`km`/`price`. |
| GET / PUT / DELETE | `/api/interescompra/{interes_id}` | admin | Get / update / delete. |

### `/api/compra` - purchase requests & contract generation

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/compra/` | admin | List requests with `status=PENDING` (car populated). |
| POST | `/api/compra/` | none (reCAPTCHA) | Create a purchase request referencing a car (`car_id`). |
| DELETE | `/api/compra/{id}` | admin | Delete a request. |
| GET | `/api/compra/generate-pdf/{id}` | admin | Fills the contract PDF template with buyer + car details and streams it back. |

### `/api/tramites` - internal paperwork tracking

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/tramites/` | admin | List all tramites (car populated). |
| POST | `/api/tramites/` | admin | Create, linked to a `car_id`. |
| DELETE | `/api/tramites/` | admin | Delete all. |
| GET / PUT / DELETE | `/api/tramites/{tramite_id}` | admin | Get / update / delete one. |

### `/api/users` - authentication & user management

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users/` | admin | List all users. |
| POST | `/api/users/signup` | none | Register (`username`, `password`, optional `firstname`/`lastname`). |
| POST | `/api/users/login` | none | Sets the `token` cookie on success. |
| POST | `/api/users/logout` | none | Clears the `token` cookie. |
| GET | `/api/users/check-auth-cookie` | none | `{"authenticated": bool}` - lets the frontend gate UI cheaply. |

### `/api/buscaplaca` - plate lookup (SIMIT/Fasecolda)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/buscaplaca/` | user | Body: `{"plate": "..."}`. Queries SIMIT + Fasecolda concurrently (retrying each up to 5x), upserts a cached result per user+plate. |
| GET | `/api/buscaplaca/history` | user | The authenticated user's past searches, newest first. |

### `/images` - static image serving

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/images/vehiculos/{path}` | none | Public inventory photos. |
| GET | `/images/ofertas/{path}` | admin | Unverified public submission photos - stays admin-only. |
