#!/usr/bin/env bash
set -euo pipefail

# Run on the Mac. Only committed source is shipped; frontend compilation stays local.
SSH_KEY=${SSH_KEY:-"$HOME/workspace/VAC/EC2/Victoriautos-server.pem"}
SSH_HOST=${SSH_HOST:-ubuntu@44.217.212.182}
REMOTE_ROOT=${REMOTE_ROOT:-/home/ubuntu/victoriautosApp}
CLOUDFRONT_DISTRIBUTION_ID=${CLOUDFRONT_DISTRIBUTION_ID:-E3IOMGR0O6E2FD}
invalidate=false
stage_only=false
for argument in "$@"; do
    case "$argument" in
        --invalidate) invalidate=true ;;
        --stage-only) stage_only=true ;;
        *) echo "Usage: $0 [--stage-only] [--invalidate]" >&2; exit 2 ;;
    esac
done
if $stage_only && $invalidate; then
    echo "--invalidate requires an active deployment, not --stage-only" >&2
    exit 2
fi
# Remote commands/rsync use a shell: restrict interpolated destination values.
[[ "$REMOTE_ROOT" =~ ^/[a-zA-Z0-9_/-]+$ && "$REMOTE_ROOT" != / ]] || exit 2
[[ "$SSH_HOST" =~ ^[a-zA-Z0-9_.@-]+$ && "$SSH_HOST" != -* ]] || exit 2
[[ -f "$SSH_KEY" ]] || { echo "SSH key not found: $SSH_KEY" >&2; exit 1; }
if $invalidate; then command -v aws >/dev/null; fi
repo_root=$(git -C "$(dirname "$0")/../.." rev-parse --show-toplevel)
cd "$repo_root"
if [[ -n $(git status --porcelain --untracked-files=all) ]]; then
    echo "Refusing deployment: commit or safely set aside all working-tree changes first." >&2
    exit 1
fi
commit=$(git rev-parse HEAD)
release="$(date -u +%Y%m%dT%H%M%SZ)-${commit:0:12}-$$"
bundle_dir=$(mktemp -d)
trap 'rm -rf -- "$bundle_dir"' EXIT
# Archive deploy tooling too, so backups and the runbook match this release.
git archive HEAD backend deploy | tar -x -C "$bundle_dir"
(
    cd frontend
    yarn install --frozen-lockfile
    yarn build
)
if [[ $(git rev-parse HEAD) != "$commit" || -n $(git status --porcelain --untracked-files=all) ]]; then
    echo "Source changed during build; refusing deployment." >&2
    exit 1
fi
ssh_args=(-i "$SSH_KEY" -o BatchMode=yes)
# A wrapper preserves key paths containing spaces in rsync's remote shell.
export VICTORIAUTOS_SSH_KEY="$SSH_KEY"
cat > "$bundle_dir/rsync-ssh" <<'WRAPPER'
#!/usr/bin/env bash
exec ssh -i "$VICTORIAUTOS_SSH_KEY" -o BatchMode=yes "$@"
WRAPPER
chmod 700 "$bundle_dir/rsync-ssh"

# Routine deploys back up the currently running data BEFORE replacing code/migrating.
if ! $stage_only; then
    ssh "${ssh_args[@]}" "$SSH_HOST" "APP_ROOT='$REMOTE_ROOT' bash '$REMOTE_ROOT/deploy/scripts/backup.sh'"
fi
ssh "${ssh_args[@]}" "$SSH_HOST" \
    "mkdir -p '$REMOTE_ROOT/backend' '$REMOTE_ROOT/frontend/releases/$release' '$REMOTE_ROOT/deploy'"
rsync -az --delete -e "$bundle_dir/rsync-ssh" \
    --exclude='.env' --exclude='.env.*' --exclude='data/' --exclude='.venv/' \
    "$bundle_dir/backend/" "$SSH_HOST:$REMOTE_ROOT/backend/"
rsync -az --delete -e "$bundle_dir/rsync-ssh" \
    "$bundle_dir/deploy/" "$SSH_HOST:$REMOTE_ROOT/deploy/"
rsync -az --chmod=D755,F644 -e "$bundle_dir/rsync-ssh" \
    "$repo_root/frontend/dist/" "$SSH_HOST:$REMOTE_ROOT/frontend/releases/$release/"
# The sample env is safe and useful for first setup (real .env is always preserved).
rsync -az -e "$bundle_dir/rsync-ssh" \
    "$bundle_dir/backend/.env.example" "$SSH_HOST:$REMOTE_ROOT/backend/.env.example"
if $stage_only; then
    echo "Staged $commit. Complete deploy/README.md setup before cutover."
    echo "Frontend release: $REMOTE_ROOT/frontend/releases/$release"
    exit 0
fi
ssh "${ssh_args[@]}" "$SSH_HOST" bash -s -- "$REMOTE_ROOT" "$release" <<'REMOTE'
set -euo pipefail
app_root=$1
release=$2
export PATH="$HOME/.local/bin:$PATH"
# Fail before migrations if first-time frontend setup has not been completed.
if [[ ! -L "$app_root/frontend/dist" ]]; then
    echo "dist must be a symlink; follow first-time setup before deploying." >&2
    exit 1
fi
cd "$app_root/backend"
uv sync --frozen --no-dev
uv run --no-sync alembic upgrade head
sudo -n systemctl restart victoriautos-api
curl -fsS --retry 12 --retry-delay 2 --retry-connrefused --max-time 8 \
    -H 'Host: victoriautos.com' http://127.0.0.1:3006/api/health
# mv -T replaces the symlink itself; it never moves it inside the target directory.
cd "$app_root/frontend"
if [[ -e dist && ! -L dist ]]; then
    echo "dist must be a symlink; follow first-time setup before deploying." >&2
    exit 1
fi
if [[ -L dist ]]; then
    readlink dist > previous-release.txt
    # Retain hashed assets for browsers still using the previous index.html.
    if [[ -d dist/assets ]]; then
        rsync -a --ignore-existing dist/assets/ "releases/$release/assets/"
    fi
fi
ln -s "releases/$release" ".dist-$release"
mv -Tf ".dist-$release" dist
printf '%s\n' "$release" > current-release.txt
REMOTE
if $invalidate; then
    aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths '/*'
fi
echo "Deployed $commit ($release)."
