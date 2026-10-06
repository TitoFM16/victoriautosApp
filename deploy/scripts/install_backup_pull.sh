#!/usr/bin/env bash
# Install (or reinstall) the launchd job that pulls server backups to this Mac.
#   bash deploy/scripts/install_backup_pull.sh
# Remove with:
#   launchctl bootout "gui/$(id -u)/com.victoriautos.pull-backups"
#   rm ~/Library/LaunchAgents/com.victoriautos.pull-backups.plist
set -euo pipefail

repo_root=$(cd "$(dirname "$0")/../.." && pwd)
label=com.victoriautos.pull-backups
target="$HOME/Library/LaunchAgents/$label.plist"

mkdir -p "$HOME/victoriautos-backups/nightly" "$HOME/Library/LaunchAgents"
sed "s|__HOME__|$HOME|g" "$repo_root/deploy/launchd/$label.plist" > "$target"
plutil -lint "$target"

launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$target"
echo "Installed $label (daily 22:00). Log: ~/victoriautos-backups/nightly/pull.log"
