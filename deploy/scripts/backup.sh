#!/usr/bin/env bash
set -euo pipefail
umask 077
APP_ROOT=${APP_ROOT:-/home/ubuntu/victoriautosApp}
BACKUP_DIR=${BACKUP_DIR:-"$HOME/backups"}
export PATH="$HOME/.local/bin:/usr/bin:/bin:$PATH"
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
# Avoid overlapping cron/manual backups. Do not source .env as shell code.
exec 9>"$BACKUP_DIR/.victoriautos-backup.lock"
flock -n 9 || { echo 'Another backup is running' >&2; exit 1; }
cd "$APP_ROOT/backend"
stamp=$(date -u +%Y%m%dT%H%M%SZ)
backup_path="$BACKUP_DIR/victoriautos-$stamp"
mkdir "$backup_path.partial"
# Read settings with the installed venv; libpq receives credentials only via env.
# Custom-format pg_dump is compatible with pg_restore; the async driver URL is
# intentionally not passed to pg_dump or included in process arguments/logs.
.venv/bin/python - "$backup_path.partial" <<'PY'
import os
import subprocess
import sys
from pathlib import Path
from sqlalchemy.engine import make_url
from victoriautos_backend.core.config import settings

output = Path(sys.argv[1])
url = make_url(settings.database_url)
env = os.environ.copy()
env.update(PGHOST=url.host or "127.0.0.1", PGPORT=str(url.port or 5432),
           PGDATABASE=url.database or "victoriautos", PGUSER=url.username or "victoriautos",
           PGPASSWORD=url.password or "", PGCONNECT_TIMEOUT="10")
subprocess.run(["pg_dump", "--no-password", "--format=custom",
                "--file", str(output / "database.dump")], env=env, check=True)
subprocess.run(["tar", "-czf", str(output / "images.tar.gz"),
                "-C", str(settings.images_dir), "."], check=True)
PY
mv "$backup_path.partial" "$backup_path"
# Delete only this script's completed backup directories older than seven days.
# Failed .partial backups remain visible for investigation.
find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d \
    -name 'victoriautos-????????T??????Z' -mmin +10080 -exec rm -rf -- {} +
echo "Backup complete: $backup_path"
