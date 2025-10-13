#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")"/.. && pwd)"
RELEASES="$ROOT_DIR/releases"
KEEP=${1:-3}

cd "$RELEASES"
# List directories sorted descending (newest first) by name (YYYY-MM-DD works lexicographically)
list=( $(ls -1d 20??-??-?? 2>/dev/null | sort -r) )
count=${#list[@]:-0}
if (( count <= KEEP )); then exit 0; fi
# Determine to delete the rest
delete=( "${list[@]:$KEEP}" )
for d in "${delete[@]}"; do
  rm -rf "$d"
  echo "Removed old release: $d"
done
