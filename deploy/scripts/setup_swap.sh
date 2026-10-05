#!/usr/bin/env bash
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo 'Run with sudo.' >&2; exit 1; }
swap_file=/swapfile
swap_bytes=2147483648
if [[ -L "$swap_file" ]]; then
    echo 'Refusing a symlink at /swapfile.' >&2
    exit 1
fi
if [[ -e "$swap_file" ]]; then
    if [[ ! -f "$swap_file" || $(stat -c %s "$swap_file") -ne $swap_bytes ]] || \
       [[ $(blkid -p -s TYPE -o value "$swap_file") != swap ]]; then
        echo 'Existing /swapfile is not the expected 2 GiB swap; inspect manually.' >&2
        exit 1
    fi
else
    # Ubuntu EC2 ext4: allocate fully, then create the swap signature once.
    install -m 600 /dev/null "$swap_file"
    fallocate -l "$swap_bytes" "$swap_file"
    mkswap "$swap_file"
fi
chmod 600 "$swap_file"
if ! swapon --show=NAME --noheadings | grep -Fxq "$swap_file"; then
    swapon "$swap_file"
fi
if ! awk '$1 == "/swapfile" && $3 == "swap" { found=1 } END { exit !found }' /etc/fstab; then
    printf '/swapfile none swap sw 0 0\n' >> /etc/fstab
fi
printf 'vm.swappiness=10\n' > /etc/sysctl.d/90-victoriautos-swap.conf
sysctl -p /etc/sysctl.d/90-victoriautos-swap.conf
swapon --show
