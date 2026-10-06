# Victoria Autos: existing EC2 production deployment

Target: `ubuntu@44.217.212.182`, Ubuntu 24.04, t2.micro (1 vCPU, 952 MB RAM,
initially no swap, about 14 GB free). No production Docker. Build React on the Mac.
CloudFront distribution `E3IOMGR0O6E2FD` provides ACM TLS and redirects viewers to
HTTPS; the origin stays HTTP :80. Keep the security group restricted to the
CloudFront prefix list and the existing trusted admin IP.

The new app lives at `/home/ubuntu/victoriautosApp`. FastAPI listens only on
`127.0.0.1:3006`, one worker, with a 350M systemd memory limit. Existing Express
(:3005), SIMIT (:8000), PostgreSQL 16 (:5432), MongoDB 6, and nginx stay installed.
Do not delete either pm2 app or change SIMIT. Retire MongoDB only in a separate task.
These are operator instructions; creating these files does not deploy anything.

## 1. Inspect and back up before making changes

SSH from the Mac using `$HOME/workspace/VAC/EC2/Victoriautos-server.pem`. On EC2,
work as `ubuntu` unless a command says `sudo`:

```bash
free -h
df -h /
pm2 list
sudo ss -lntp
sudo nginx -T
sudo systemctl status postgresql
```

Record the existing `express-backend` symlink target and `/simit-api/` stanza.
Compare that stanza to the supplied config before cutover: prefix removal,
localhost:8000, X-Forwarded headers, and all 120s timeouts must be retained. The
supplied stanza implements the behavior specified for this box; its exact live
text has not been read remotely. Save nginx configuration and pm2 state privately.

```bash
umask 077
snapshot="$HOME/backups/pre-cutover-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$snapshot"
sudo tar -czf "$snapshot/nginx.tar.gz" -C /etc nginx
sudo chown ubuntu:ubuntu "$snapshot/nginx.tar.gz"
pm2 jlist > "$snapshot/pm2.json"
sudo -u postgres pg_dump -Fc vehiculos_db > "$snapshot/vehiculos_db.dump"
# If Mongo authentication is enabled, use its existing admin authentication options;
# do not disable authentication or put passwords in shell history.
mongodump --host 127.0.0.1 --port 27017 --archive="$snapshot/mongo.archive.gz" --gzip
tar -czf "$snapshot/images.tar.gz" \
  -C "$HOME/workspace/victoriautosServer/public" images
pg_restore --list "$snapshot/vehiculos_db.dump" > /dev/null
tar -tzf "$snapshot/images.tar.gz" > /dev/null
printf 'Snapshot: %s\n' "$snapshot"
```

Stop if any backup fails or storage is insufficient. Measure the images and Mongo
sizes first; 2 GiB swap plus backups, exports, venv, and releases must fit the 14 GB.
From the Mac, copy the exact printed snapshot path off-box (substitute timestamp):

```bash
mkdir -p "$HOME/victoriautos-backups"
scp -i "$HOME/workspace/VAC/EC2/Victoriautos-server.pem" -r \
  ubuntu@44.217.212.182:/home/ubuntu/backups/pre-cutover-TIMESTAMP \
  "$HOME/victoriautos-backups/"
```

Verify the local archives can be listed; keep the Mongo archive for a restore
rehearsal on an isolated database. Protect backups: they contain customer data and
possibly credentials. Repeat the final backup/export after freezing legacy writes
in step 5. A live database dump and image tar are not a single atomic snapshot.

## 2. Stage committed code and install runtime

On the Mac, finish review and commit through your normal workflow first. This task
does not commit. The script refuses tracked or untracked changes and builds with
Yarn. It exports `backend/` and `deploy/` from HEAD, preserving server `.env`,
`data/`, and `.venv`. Nothing invokes the old `SCRIPTS/CI_CD_SCRIPTS/DEPLOY_EC2.sh`.

```bash
bash deploy/scripts/deploy.sh --stage-only
```

Record the printed frontend release path. `--stage-only` is for first setup: it
uploads code/assets but does not sync dependencies, migrate, restart, switch the
frontend, or touch nginx. Do not use it to stage over a running new backend.

On EC2:

```bash
sudo apt-get update
sudo apt-get install -y curl ca-certificates rsync acl
sudo bash /home/ubuntu/victoriautosApp/deploy/scripts/setup_swap.sh
# Run the uv installer as ubuntu, NOT root. Inspect it before executing.
curl -LsSf https://astral.sh/uv/install.sh -o /tmp/victoriautos-install-uv.sh
less /tmp/victoriautos-install-uv.sh
sh /tmp/victoriautos-install-uv.sh
export PATH="$HOME/.local/bin:$PATH"
uv python install 3.13
cd /home/ubuntu/victoriautosApp/backend
uv venv --python 3.13
uv sync --frozen --no-dev
```

Swap setup is idempotent for an existing 2 GiB `/swapfile`; it refuses to overwrite
an unexpected file, persists the swap in `/etc/fstab`, and sets
`vm.swappiness=10`. Confirm `swapon --show` and `free -h`. Swap gives headroom; image
conversion and overlapping old/new services can still hit the service memory cap.

## 3. Create PostgreSQL owner and production configuration

Use peer authentication as the OS postgres user; `psql -U postgres` from ubuntu may
fail under `pg_hba.conf`. Check for existing role/database before creating them:

```bash
sudo -u postgres psql
```

Inside psql:

```sql
\du victoriautos
\l victoriautos
-- Run these CREATE statements only when the corresponding object is absent.
CREATE ROLE victoriautos LOGIN;
\password victoriautos
CREATE DATABASE victoriautos OWNER victoriautos;
\q
```

Choose the role password privately and put that SAME password, URL-encoded, in
`DATABASE_URL` below. If the objects already exist, verify ownership and credentials
instead of replacing them. Keep PostgreSQL bound to localhost. Its host rules must
allow the role to connect to `victoriautos` at `127.0.0.1:5432` with SCRAM password
authentication; keep local peer rules for postgres. Do not open PostgreSQL in the SG.

```bash
cd /home/ubuntu/victoriautosApp/backend
install -m 600 .env.example .env   # first time only; never overwrite an existing .env
nano .env
chmod 600 .env
mkdir -p data/images/vehiculos data/images/ofertas
```

Set every value from `.env.example` deliberately. Required production overrides:

```dotenv
ENVIRONMENT=production
DATABASE_URL=postgresql+asyncpg://victoriautos:URL_ENCODED_PASSWORD@127.0.0.1:5432/victoriautos
SECRET_KEY=GENERATE_A_NEW_RANDOM_SECRET
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_SECONDS=3600
RECAPTCHA_SECRET_KEY=YOUR_RECAPTCHA_V2_SECRET
RECAPTCHA_VERIFY_URL=https://www.google.com/recaptcha/api/siteverify
IMAGES_DIR=/home/ubuntu/victoriautosApp/backend/data/images
CORS_ORIGINS=["https://victoriautos.com","https://www.victoriautos.com","https://d2gyx3l0a1l011.cloudfront.net"]
MAX_UPLOAD_SIZE_BYTES=20971520
MAX_UPLOAD_FILES=6
WEBP_QUALITY=80
# Uploads are downscaled to this long edge; a thumb/ copy is made for cards.
IMAGE_MAX_DIMENSION=1600
IMAGE_THUMB_DIMENSION=640
SIMIT_API_URL=http://127.0.0.1:8000/search
FASECOLDA_API_URL=https://fasecolda-api.onrender.com/search
PLATE_LOOKUP_MAX_RETRIES=5
CONTRACT_TEMPLATE_PATH=/home/ubuntu/victoriautosApp/backend/templates/Contrato-Compraventa-de-Vehiculo-Automotor-Minerva.pdf
```

Generate the JWT secret with `uv run --no-sync python -c "import secrets;
print(secrets.token_urlsafe(64))"`. Do not source `.env` as shell code: CORS is a JSON
array. systemd and Pydantic read the file. Omit `TEST_DATABASE_URL` in production;
never run pytest against this database. Keep the reCAPTCHA frontend site key paired
with the secret, and add `victoriautos.com` and `www.victoriautos.com` to its allowed
domains. Changing a frontend build-time key requires rebuilding locally.

```bash
uv run --no-sync alembic upgrade head
```

## 4. Rehearse imports and bootstrap the service

Import the old PostgreSQL catalog using the actual legacy read credentials:

```bash
cd /home/ubuntu/victoriautosApp/backend
uv run --no-sync python scripts/migrate_vehicle_catalog.py \
  --source 'postgresql://LEGACY_USER:URL_ENCODED_PASSWORD@127.0.0.1:5432/vehiculos_db'
```

Avoid saving the credential-bearing command in shell history. This script skips
duplicate catalog combinations. For the separately developed
`backend/scripts/migrate_legacy_mongo.py`, verify its reviewed version is present
and run `--help`. Its input is a directory of **mongosh EJSON array exports**, one
`<collection>.json` per collection, not a mongodump archive or JSON Lines.

Use the actual legacy database name and existing authentication. For example,
inside an authenticated `mongosh` session against that database:

```javascript
const fs = require('fs');
const out = '/home/ubuntu/legacy-ejson';
fs.mkdirSync(out, { recursive: true, mode: 0o700 });
for (const collection of db.getCollectionNames()) {
  fs.writeFileSync(`${out}/${collection}.json`,
    EJSON.stringify(db.getCollection(collection).find().toArray(), null, 2,
      { relaxed: false }), { mode: 0o600 });
}
```

Export one collection at a time; `toArray()` and the importer need memory
proportional to a collection. Inspect sizes and swap usage. Review the importer's
supported collections and summary; missing files, dropped relationships, user
password compatibility, and image ID mapping need resolution before cutover.
The current CLI contract is:

```bash
uv run --no-sync python scripts/migrate_legacy_mongo.py \
  --export-dir /home/ubuntu/legacy-ejson \
  --images-root /home/ubuntu/workspace/victoriautosServer/public/images --dry-run
```

Use dry-run for rehearsal. Do the committed import from the final frozen exports
in step 5. Do not assume rerunning will update records from an earlier real import.
If this script is still forthcoming or its validation fails, postpone cutover.

Copy the old image directories, retaining their names (the importer must preserve
or explicitly map UUID paths), with no `--delete`:

```bash
rsync -a ~/workspace/victoriautosServer/public/images/vehiculos/ \
  /home/ubuntu/victoriautosApp/backend/data/images/vehiculos/
rsync -a ~/workspace/victoriautosServer/public/images/ofertas/ \
  /home/ubuntu/victoriautosApp/backend/data/images/ofertas/
cd /home/ubuntu/victoriautosApp
sudo install -m 644 deploy/systemd/victoriautos-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now victoriautos-api
sudo systemctl status victoriautos-api
journalctl -u victoriautos-api -n 50 --no-pager
```

The systemd service directly
executes the uv venv's uvicorn, requires the images directory to exist, and grants
writes there through `ProtectHome=read-only` + `ReadWritePaths`. If you change
`IMAGES_DIR`, change `ReadWritePaths` too. No production Node/Yarn install is needed.

## 5. Final data freeze, smoke test, and cutover

Schedule a short maintenance window. Freeze legacy writes before the final
backup/export/import/image sync: stop staff editing and temporarily restrict
legacy `/api/` in the existing nginx site to a maintenance response, then test and
reload nginx. Leave `/simit-api/` available. Also stop any legacy background writers
if present. Keep Express running until the final switch. Save the original nginx
configuration so rollback can restore it. Do not import moving legacy data.

Repeat step 1's backup and off-box copy, export EJSON again, rerun the catalog
import if needed, run the Mongo importer **without `--dry-run`**, and repeat both
image rsync commands. Verify record counts, representative relationships, inventory
visibility, and actual image URLs. Bootstrap an admin **only if no usable imported
admin exists**:

```bash
cd /home/ubuntu/victoriautosApp/backend
uv run --no-sync python scripts/create_admin.py --username admin
```

Keep this password private. Verify the other agent's legacy-password migration
before relying on imported user logins.

On EC2, direct API smoke tests (these require no paid/external API calls):

```bash
curl -fsS -H 'Host: victoriautos.com' http://127.0.0.1:3006/api/health
curl -fsS -H 'Host: victoriautos.com' http://127.0.0.1:3006/api/
curl -fsS -H 'Host: victoriautos.com' 'http://127.0.0.1:3006/api/cars/?limit=1'
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3006/docs
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3006/redoc
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3006/openapi.json
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3006/api/admin/cars
```

Expect health `{"status":"ok"}`, inventory JSON, docs 404, and unauthenticated admin
401. `/api/health` performs `SELECT 1`, has a five-second DB timeout, and returns 503
without database details on failure. `/api/` remains a DB-independent liveness route.

Activate the release path printed by `--stage-only` (replace `RELEASE`):

```bash
cd /home/ubuntu/victoriautosApp/frontend
test ! -e dist && test ! -L dist
ln -s releases/RELEASE .dist-next
mv -T .dist-next dist
# Let nginx traverse only the relevant directories; keep .env private.
sudo setfacl -m u:www-data:--x /home/ubuntu /home/ubuntu/victoriautosApp
chmod 755 . releases
find releases/RELEASE -type d -exec chmod 755 {} +
find releases/RELEASE -type f -exec chmod 644 {} +
cd /home/ubuntu/victoriautosApp
sudo install -m 644 deploy/nginx/victoriautos.conf /etc/nginx/sites-available/victoriautos
```

If `dist` already exists, inspect and move it to a named backup instead of deleting
it. Confirm `sudo -u www-data test -r frontend/dist/index.html` succeeds.

Before exposing traffic, CloudFront must forward cookies/Host/query strings to the
API, allow all required methods (including POST/PUT/DELETE/OPTIONS), and leave the
default behavior CachingDisabled + AllViewer. Add an explicit
`/images/ofertas/*` CachingDisabled + AllViewer behavior **ahead of extension cache
behaviors**: these images require admin cookies and must never be shared from cache.
Do the same for `/api/*` if an extension pattern could match an API path. Keep
public hashed assets cached. Do not cache index.html or SPA navigation responses.

Cutover commands (remove the exact old enabled symlink only, keep its config):

```bash
sudo ln -s /etc/nginx/sites-available/victoriautos /etc/nginx/sites-enabled/victoriautos
sudo unlink /etc/nginx/sites-enabled/express-backend
sudo nginx -t && sudo systemctl reload nginx
# Only after the reload succeeds:
pm2 stop express
```

If nginx validation fails, restore the old enabled link and remove the new one;
nginx continues serving its previous configuration until a successful reload.
Never stop or restart `simit-api`. Verify the new routes via nginx:

```bash
curl -fsS -H 'Host: victoriautos.com' http://127.0.0.1/api/health
curl -fsS -H 'Host: victoriautos.com' http://127.0.0.1/admin/negocios > /dev/null
curl -I -H 'Host: victoriautos.com' http://127.0.0.1/index.html
curl -sS -H 'Host: victoriautos.com' http://127.0.0.1/simit-api/openapi.json > /dev/null
# From the Mac (AWS CLI credentials need cloudfront:CreateInvalidation):
aws cloudfront create-invalidation --distribution-id E3IOMGR0O6E2FD --paths '/*'
```

Compare the SIMIT smoke response with its pre-cutover response (it may disable
OpenAPI; avoid submitting a paid plate lookup just to probe it). Check HTTPS in a
browser: homepage, `/admin/*` deep link reload, login/logout, inventory images,
admin-only offer images, a lead form with real reCAPTCHA, and a six-image upload.
Production cookies are Secure, so authenticate over public HTTPS, not local HTTP.
Confirm public health over `https://victoriautos.com/api/health` and wait for the
CloudFront invalidation to complete. Once accepted, `pm2 save` as ubuntu preserves
Express's stopped state and SIMIT's running state across reboot; inspect `pm2 list`
first. Do not delete Express.

## 6. Rollback

Keep the pre-cutover nginx config, Express pm2 definition, legacy databases/images,
and off-box backups. New PostgreSQL writes are **not** copied back to MongoDB.
If traffic has written to the new app, freeze writes and back up the new DB/images
first; reconcile those writes before reopening the old app. Never silently discard
them or automatically downgrade/restore a database.

Restore the original `express-backend` file if a maintenance restriction was added,
then on EC2:

```bash
pm2 start express
curl -sS -H 'Host: victoriautos.com' http://127.0.0.1:3005/api/
sudo ln -s /etc/nginx/sites-available/express-backend /etc/nginx/sites-enabled/express-backend
sudo unlink /etc/nginx/sites-enabled/victoriautos
sudo nginx -t && sudo systemctl reload nginx
# After the old site works:
sudo systemctl stop victoriautos-api
pm2 save
```

Leave SIMIT untouched. Invalidate CloudFront `/*` again with the command above,
then verify HTTPS, login, images, and SIMIT. Preserve new data for reconciliation.
Do not uninstall the new service or restore over either database during rollback.

## 7. Routine deploys, backup schedule, and logs

Before each release, review Alembic changes for compatibility with the running
version; the script syncs backend files in place and migrates before restart, so
incompatible changes require a maintenance window. It makes a DB/image backup
first, then syncs dependencies using `uv sync --frozen --no-dev`, migrates with
`uv run --no-sync alembic upgrade head`, restarts only `victoriautos-api`, checks
health, and atomically switches `frontend/dist` to a versioned release. Failure
stops the script; it does not attempt an unsafe migration rollback. Backend code
is not switched atomically. Keep the previous commit recorded for recovery.

```bash
# On the Mac from a clean, committed checkout:
bash deploy/scripts/deploy.sh --invalidate
```

Optional environment overrides: `SSH_KEY`, `SSH_HOST`, `REMOTE_ROOT`, and
`CLOUDFRONT_DISTRIBUTION_ID`. Changing the remote root also requires adapting the
installed nginx/systemd paths and backup `APP_ROOT`; defaults are for this exact
box. `--invalidate` is optional for routine releases, mandatory after cutover or
rollback. Review/install nginx or systemd config updates separately: the script
uploads them but does not activate privileged configuration changes.

The previous frontend target is in `frontend/previous-release.txt`. For a frontend
rollback, verify that target exists, make a temporary symlink to it, and use
`mv -Tf` onto `dist`, then invalidate CloudFront. For backend rollback, deploy the
previous reviewed commit only if it works with the current schema; otherwise use
the maintenance/reconciliation procedure. An invalidation failure can occur after
a successful deploy: retry invalidation without repeating migrations unnecessarily.

The script retains old hashed assets for already-open browsers. Monitor disk usage
and prune explicitly reviewed old release directories/assets during maintenance;
there is no automatic release deletion. Keep current and previous releases.

Install the backup cron as **ubuntu** and log rotation as root:

```bash
mkdir -p /home/ubuntu/backups
chmod 700 /home/ubuntu/backups
bash /home/ubuntu/victoriautosApp/deploy/scripts/backup.sh
crontab -e
# Add (02:30 in the server's timezone; confirm with timedatectl):
30 2 * * * /bin/bash /home/ubuntu/victoriautosApp/deploy/scripts/backup.sh >> /home/ubuntu/backups/backup.log 2>&1

sudo install -m 644 /home/ubuntu/victoriautosApp/deploy/logrotate/victoriautos /etc/logrotate.d/victoriautos
sudo logrotate --debug /etc/logrotate.d/victoriautos
```

Each successful backup holds a custom-format `database.dump` and `images.tar.gz`
under `~/backups/victoriautos-TIMESTAMP`; completed sets older than seven days are
removed. Failed `.partial` directories remain for investigation. The script uses
`.env` settings via Python, not shell evaluation; no DB passwords appear in process
arguments. Dumps plus live image archives can race with writes: use a write freeze
for a consistent cutover/restore point. Rehearse pg_restore in an isolated database,
never the production database. Check the cron log and available disk regularly.
An optional later improvement is an encrypted off-box S3 copy with lifecycle rules;
S3 is not required by these scripts. Local nightly copies do not protect against
loss of the EC2 disk; keep the pre-cutover copy off-box now.

### Off-box copy to the Mac

The Mac pulls finished backup sets every day at 22:00 Colombia time (30 minutes
after the server's 02:30 UTC run) into `~/victoriautos-backups/nightly/`,
verifying each dump header and tarball before keeping it, and keeps the newest
30 sets. If the Mac is asleep at 22:00, launchd runs the job on wake; a failed
run shows a macOS notification and is logged in `pull.log` there.

```bash
bash deploy/scripts/install_backup_pull.sh   # install or reinstall the launchd job
bash deploy/scripts/pull_backups.sh          # pull now, by hand
launchctl bootout "gui/$(id -u)/com.victoriautos.pull-backups"   # uninstall
```

pm2 logs and the old `error.txt` rotate weekly, retaining four compressed rotations
with copytruncate (a small write race is inherent). Check for an existing pm2
logrotate module to avoid double rotation. New API output goes to journald:
`journalctl -u victoriautos-api`; monitor its disk usage and memory/restart count
with `journalctl --disk-usage` and `systemctl status victoriautos-api`.

## Proxy and application decisions

- `MAX_UPLOAD_SIZE_BYTES=20971520` is **per file**, not per request. Both forms send
  six images; the backend now enforces `MAX_UPLOAD_FILES=6` with 413 on overflow.
  nginx `client_max_body_size 125m` permits 120 MiB of files plus 5 MiB of multipart
  overhead. Processing is sequential and bounded per read, with partial output
  cleanup on failure. Keep all three settings aligned if limits change; decoded
  images and concurrent uploads can still exhaust 350M, so test representative
  production photos and inspect OOM/restart logs.
- The nginx `map` extracts the rightmost X-Forwarded-For entry, which CloudFront
  appends, falling back to the socket address. It replaces the chain for FastAPI;
  uvicorn trusts forwarded headers only from loopback, so slowapi keys on the
  viewer address. The allowed admin-IP exception must be trusted: direct requests
  through that exception can set headers. Do not broaden origin access.
  See nginx's [map documentation](https://nginx.org/en/docs/http/ngx_http_map_module.html).
- nginx 1.24 does not merge location `add_header` directives with server headers,
  so security headers are repeated in the cache-header locations. CORS stays in
  FastAPI; no wildcard origin header is added. See nginx's
  [header inheritance documentation](https://nginx.org/en/docs/http/ngx_http_headers_module.html).
- Production disables `/docs`, `/redoc`, and `/openapi.json`; development retains
  them. Existing `/api/` stays available; `/api/health` checks the database.
- Legacy `/api/search/stats` has no implementation or new equivalent: the dashboard
  now says statistics are unavailable. Legacy `/api/admin/match` returns computed
  `{car, interes}` / `{oferta, interes}` pairs without a match ID; there is no
  `/api/negocios/{id}` resource. Matches are read-only in the UI. Deleting a lead
  instead would have removed data beyond the requested match, so it is not used
  as a substitute. Existing `/api/admin/match` calls remain unchanged.
