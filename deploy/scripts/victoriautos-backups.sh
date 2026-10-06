#!/usr/bin/env bash
# On-demand copies of the EC2 backups (database.dump + images.tar.gz) to this Mac.
# Nothing runs in the background: you run it when you want a fresh off-box copy.
#
#   victoriautos-backups pull [--keep N]   copy finished server backups not yet on the Mac
#   victoriautos-backups now  [--keep N]   take a fresh backup on the server, then pull
#   victoriautos-backups list              show server and local backups
#
# Install the command once (symlink on your PATH):
#   ln -sf "$PWD/deploy/scripts/victoriautos-backups.sh" ~/.local/bin/victoriautos-backups
set -euo pipefail

SSH_KEY="${SSH_KEY:-$HOME/workspace/VAC/EC2/Victoriautos-server.pem}"
SSH_HOST="${SSH_HOST:-ubuntu@44.217.212.182}"
DEST="${DEST:-$HOME/victoriautos-backups/nightly}"
KEEP=30
ssh_opts=(-i "$SSH_KEY" -o BatchMode=yes -o ConnectTimeout=20)

usage() { sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'; }
log() { echo "$(date '+%F %T') $*"; }

remote_sets() {
    ssh "${ssh_opts[@]}" "$SSH_HOST" \
        'cd ~/backups && for d in victoriautos-*; do [[ -d $d && $d != *.partial ]] && echo "$d"; done'
}

pull() {
    umask 077
    mkdir -p "$DEST"
    local copied=0 set tmp
    for set in $(remote_sets); do
        [[ $set =~ ^victoriautos-[0-9TZ]+$ ]] || continue
        [[ -d "$DEST/$set" ]] && continue
        tmp="$DEST/.incoming-$set"
        rm -rf "$tmp"
        scp -q -r "${ssh_opts[@]}" "$SSH_HOST:backups/$set" "$tmp"
        # Verify: non-empty dump with the pg_dump custom-format header, readable tarball.
        if [[ ! -s "$tmp/database.dump" || $(head -c 5 "$tmp/database.dump") != "PGDMP" ]] \
            || ! gzip -t "$tmp/images.tar.gz"; then
            rm -rf "$tmp"
            log "ERROR: $set failed verification; not kept" >&2
            exit 1
        fi
        mv "$tmp" "$DEST/$set"
        copied=$((copied + 1))
        log "copied $set ($(du -sh "$DEST/$set" | cut -f1))"
    done

    # Keep the newest $KEEP sets (names sort chronologically; macOS head has no
    # negative -n, so sort newest-first and skip the first $KEEP).
    local old
    for old in $(find "$DEST" -maxdepth 1 -type d -name 'victoriautos-*' | sort -r | tail -n "+$((KEEP + 1))"); do
        rm -rf -- "$old"
        log "pruned $(basename "$old")"
    done
    log "done: $copied new, $(find "$DEST" -maxdepth 1 -type d -name 'victoriautos-*' | wc -l | tr -d ' ') on this Mac ($DEST)"
}

list() {
    echo "Server (~/backups, kept 7 days):"
    ssh "${ssh_opts[@]}" "$SSH_HOST" 'cd ~/backups && du -sh victoriautos-* 2>/dev/null | sed "s/^/  /"' || true
    echo "This Mac ($DEST):"
    if compgen -G "$DEST/victoriautos-*" >/dev/null; then
        du -sh "$DEST"/victoriautos-* | sed "s|$DEST/||; s/^/  /"
    else
        echo "  (none yet)"
    fi
}

command="${1:-help}"
shift || true
while [[ $# -gt 0 ]]; do
    case "$1" in
        --keep) KEEP="${2:?--keep needs a number}"; shift 2 ;;
        *) echo "Unknown option: $1" >&2; usage; exit 2 ;;
    esac
done
[[ $KEEP =~ ^[1-9][0-9]*$ ]] || { echo "--keep must be a positive number" >&2; exit 2; }

case "$command" in
    pull) pull ;;
    now)
        log "taking a fresh backup on the server..."
        ssh "${ssh_opts[@]}" "$SSH_HOST" 'bash ~/victoriautosApp/deploy/scripts/backup.sh' | tail -1
        pull ;;
    list) list ;;
    help | -h | --help) usage ;;
    *) echo "Unknown command: $command" >&2; usage; exit 2 ;;
esac
