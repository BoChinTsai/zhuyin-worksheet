#!/bin/sh

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

while IFS= read -r code; do
  sleep 2
  curl --retry 1 --retry-delay 2 --connect-timeout 10 --max-time 30 \
    --fail --silent --show-error --location \
    "https://stroke.gh.miniasp.com/data/${code}.xml" \
    -o "$data_dir/${code}.xml" \
    || printf '%s\n' "$code" >> "$failures"
done < "$remaining"

find "$data_dir" -type f -name '*.xml' | wc -l
