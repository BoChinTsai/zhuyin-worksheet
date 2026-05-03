export function cleanCharacters(value) {
  return value.match(/[\u2E80-\u2FD5\u3190-\u319f\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/g) ?? [];
}

export function uniqueCharacters(value) {
  return [...new Set(cleanCharacters(value))];
}

