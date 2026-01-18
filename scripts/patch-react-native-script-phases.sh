#!/usr/bin/env bash
# Patch react_native_pods_utils/script_phases.sh error() to use echo, not bare string
set -e
SCRIPT="node_modules/react-native/scripts/react_native_pods_utils/script_phases.sh"
if [ -f "$SCRIPT" ]; then
  # Only patch if not already patched
  if ! grep -q 'echo "$1"' "$SCRIPT"; then
    sed -i.bak "/^error () {/,/^}/c\
error () {\
  echo \"$1\"\
  if [ -n \"\${SCRIPT_OUTPUT_FILE_0:-}\" ]; then\
    echo \"[Codegen] $1\" >> \"\${SCRIPT_OUTPUT_FILE_0}\" 2>&1\
  fi\
  exit 1\
}" "$SCRIPT"
    echo "[patch-script_phases] Patched error() in $SCRIPT"
  else
    echo "[patch-script_phases] Already patched: $SCRIPT"
  fi
else
  echo "[patch-script_phases] Not found: $SCRIPT"
fi
