#!/bin/bash
# List docs files modified within N days that need translation.
# Usage: ./list-translate-files.sh [days]
# Example: ./list-translate-files.sh 45

TARGET_DIR="docs"
DAYS=${1:-60}
CUTOFF=$(date -v-${DAYS}d +%s 2>/dev/null || date -d "-${DAYS} days" +%s)

echo "Scanning files… (cutoff = ${DAYS} days)" >&2

count=0
while IFS= read -r file; do
  [[ "$file" == *.cn.mdx ]] && continue

  date_str=$(git log -1 --format=%ci -- "$file" 2>/dev/null)
  [[ -z "$date_str" ]] && continue

  file_ts=$(date -j -f "%Y-%m-%d %H:%M:%S %z" "$date_str" +%s 2>/dev/null || date -d "$date_str" +%s)

  if [[ $file_ts -ge $CUTOFF ]]; then
    echo "$file | $date_str"
    ((count++))
  fi
done < <(git ls-files "$TARGET_DIR" | sort)

echo ""
echo "Found ${count} files to translate."
