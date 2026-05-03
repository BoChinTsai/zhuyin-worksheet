import * as OpenCC from "opencc-js";
import { pinyin } from "pinyin-pro";
import { pinyinToZhuyin } from "pinyin-zhuyin";
import { cleanCharacters } from "./chinese.js";

const traditionalToSimplified = OpenCC.Converter({ from: "tw", to: "cn" });

const phraseOverrides = [
  { phrase: "銀行", pinyin: ["yín", "háng"] },
  { phrase: "银行", pinyin: ["yín", "háng"] },
];

export function getContextualPronunciations(text) {
  const characters = cleanCharacters(text);
  const simplifiedText = traditionalToSimplified(text);
  const simplifiedCharacters = cleanCharacters(simplifiedText);
  const pronunciations = pinyin(simplifiedText, {
    toneType: "symbol",
    type: "array",
    nonZh: "removed",
  }).slice(0, simplifiedCharacters.length);

  for (const override of phraseOverrides) {
    applyPhraseOverride(simplifiedText, simplifiedCharacters, pronunciations, override);
  }

  return characters.map((character, index) => ({
    character,
    pinyin: pronunciations[index] ? [pronunciations[index]] : [],
    zhuyin: pronunciations[index] ? [pinyinToZhuyin(pronunciations[index])] : [],
  }));
}

function applyPhraseOverride(text, characters, pronunciations, override) {
  let searchFrom = 0;
  while (searchFrom < text.length) {
    const phraseIndex = text.indexOf(override.phrase, searchFrom);
    if (phraseIndex < 0) return;

    const characterIndex = cleanCharacters(text.slice(0, phraseIndex)).length;
    for (let i = 0; i < override.pinyin.length; i += 1) {
      if (characters[characterIndex + i] === override.phrase[i]) {
        pronunciations[characterIndex + i] = override.pinyin[i];
      }
    }
    searchFrom = phraseIndex + override.phrase.length;
  }
}

