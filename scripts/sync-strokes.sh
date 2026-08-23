#!/usr/bin/env bash

set -u

base_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
data_dir="$base_dir/public/strokes"
manifest="/private/tmp/zhuyin-stroke-codepoints.txt"
downloaded="/private/tmp/zhuyin-stroke-downloaded.txt"
remaining="/private/tmp/zhuyin-stroke-remaining.txt"
failures="/private/tmp/zhuyin-stroke-failures-slow.txt"

mkdir -p "$data_dir"
curl --fail --silent --show-error --location \
  https://stroke.gh.miniasp.com/data-index.json \
  | jq -r '.codepoints[]' > "$manifest"

find "$data_dir" -type f -name '*.xml' \
  | sed 's#^.*/##; s#\.xml$##' \
  | sort -u > "$downloaded"
comm -23 <(sort "$manifest") "$downloaded" > "$remaining"
: > "$failures"

download_code() {
  local code="$1"
  local temporary="$data_dir/${code}.xml.part"

  sleep 2
  if curl --retry 1 --retry-delay 2 --connect-timeout 10 --max-time 30 \
    --fail --silent --show-error --location \
    "https://stroke.gh.miniasp.com/data/${code}.xml" \
    -o "$temporary"; then
    mv "$temporary" "$data_dir/${code}.xml"
    return 0
  fi

  printf '%s\n' "$code" >> "$failures"
  return 1
}

completed=0
while IFS= read -r code; do
  download_code "$code" || true
  completed=$((completed + 1))
  if ((completed % 25 == 0)); then
    printf 'progress: %s/%s files\n' "$completed" "$(wc -l < "$remaining" | tr -d ' ')"
  fi
done < "$remaining"

if [ -s "$failures" ]; then
  sort -u "$failures" > "${failures}.retry"
  : > "$failures"
  while IFS= read -r code; do
    download_code "$code" || true
  done < "${failures}.retry"
fi

printf 'finished: %s XML files\n' "$(find "$data_dir" -type f -name '*.xml' | wc -l | tr -d ' ')"
if [ -s "$failures" ]; then
  printf 'remaining failures: %s\n' "$(sort -u "$failures" | wc -l | tr -d ' ')"
else
  printf 'remaining failures: 0\n'
fi
