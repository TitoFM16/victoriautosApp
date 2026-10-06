#!/usr/bin/env bash
# Pull completed nightly backups (database.dump + images.tar.gz) from the EC2
# box to this Mac, so a lost server disk does not take the backups with it.
# Runs from launchd (deploy/launchd/com.victoriautos.pull-backups.plist) or by hand:
#   bash deploy/scripts/pull_backups.sh
# Only finished sets (no .partial suffix) are copied; each lands in a temp dir,
# is verified, then renamed into place. The newest $KEEP sets are kept locally.
set -euo pipefail

SSH_KEY="${SSH_KEY:-$HOME/workspace/VAC/EC2/Victoriautos-server.pem}"
SSH_HOST="${SSH_HOST:-ubuntu@44.217.212.182}"
DEST="${DEST:-$HOME/victoriautos-backups/nightly}"
KEEP="${KEEP:-30}"
ssh_opts=(-i "$SSH_KEY" -o BatchMode=yes -o ConnectTimeout=20)

notify_failure() {
    osascript -e "display notification \"Revisa $DEST/pull.log\" with title \"Victoriautos: falló la copia de backups\"" >/dev/null 2>&1 || true
}
trap 'echo "$(date "+%F %T") FAILED (line $LINENO)"; notify_failure' ERR

umask 077
mkdir -p "$DEST"
echo "$(date '+%F %T') start"

remote_sets=$(ssh "${ssh_opts[@]}" "$SSH_HOST" \
    'cd ~/backups && for d in victoriautos-*; do [[ -d $d && $d != *.partial ]] && echo "$d"; done')

copied=0
for set in $remote_sets; do
    [[ $set =~ ^victoriautos-[0-9TZ]+$ ]] || continue
    [[ -d "$DEST/$set" ]] && continue
    tmp="$DEST/.incoming-$set"
    rm -rf "$tmp"
    scp -q -r "${ssh_opts[@]}" "$SSH_HOST:backups/$set" "$tmp"
    # Verify: a non-empty dump with the pg_dump custom-format header, and a readable tarball.
    [[ -s "$tmp/database.dump" && $(head -c 5 "$tmp/database.dump") == "PGDMP" ]]
    gzip -t "$tmp/images.tar.gz"
    mv "$tmp" "$DEST/$set"
    copied=$((copied + 1))
    echo "$(date '+%F %T') copied $set ($(du -sh "$DEST/$set" | cut -f1))"
done

# Retention: keep the newest $KEEP sets (names sort chronologically).
# (macOS head has no negative -n, so sort newest-first and skip the first $KEEP.)
old_sets=$(find "$DEST" -maxdepth 1 -type d -name 'victoriautos-*' | sort -r | tail -n "+$((KEEP + 1))")
for old in $old_sets; do
    rm -rf -- "$old"
    echo "$(date '+%F %T') pruned $(basename "$old")"
done

echo "$(date '+%F %T') done: $copied new, $(find "$DEST" -maxdepth 1 -type d -name 'victoriautos-*' | wc -l | tr -d ' ') kept"
