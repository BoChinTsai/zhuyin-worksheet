import { pinyinToZhuyin } from "pinyin-zhuyin";

const entries = {
  "今": { definition: "today; now; current", pinyin: ["jīn"], radical: "人", radicalMeaning: "person" },
  "天": { definition: "day; sky; heaven", pinyin: ["tiān"], radical: "大", radicalMeaning: "big" },
  "我": { definition: "I; me; my", pinyin: ["wǒ"], radical: "戈", radicalMeaning: "weapon" },
  "想": { definition: "to think; to want; to miss", pinyin: ["xiǎng"], radical: "心", radicalMeaning: "heart" },
  "寫": { definition: "to write; to compose", pinyin: ["xiě"], radical: "宀", radicalMeaning: "roof" },
  "写": { definition: "to write; to compose", pinyin: ["xiě"], radical: "冖", radicalMeaning: "cover" },
  "你": { definition: "you", pinyin: ["nǐ"], radical: "人", radicalMeaning: "person" },
  "好": { definition: "good; well", pinyin: ["hǎo"], radical: "女", radicalMeaning: "woman" },
  "是": { definition: "to be; yes", pinyin: ["shì"], radical: "日", radicalMeaning: "sun" },
  "不": { definition: "not; no", pinyin: ["bù"], radical: "一", radicalMeaning: "one" },
  "了": { definition: "completed action marker", pinyin: ["le"], radical: "亅", radicalMeaning: "hook" },
  "有": { definition: "to have; there is", pinyin: ["yǒu"], radical: "月", radicalMeaning: "moon; flesh" },
  "學": { definition: "to study; to learn", pinyin: ["xué"], radical: "子", radicalMeaning: "child" },
  "学": { definition: "to study; to learn", pinyin: ["xué"], radical: "子", radicalMeaning: "child" },
  "中": { definition: "middle; China", pinyin: ["zhōng"], radical: "丨", radicalMeaning: "line" },
  "文": { definition: "language; writing", pinyin: ["wén"], radical: "文", radicalMeaning: "script" },
  "字": { definition: "character; word", pinyin: ["zì"], radical: "子", radicalMeaning: "child" },
  "的": { definition: "possessive particle", pinyin: ["de"], radical: "白", radicalMeaning: "white" },
  "在": { definition: "at; in; to be located", pinyin: ["zài"], radical: "土", radicalMeaning: "earth" },
  "人": { definition: "person; people", pinyin: ["rén"], radical: "人", radicalMeaning: "person" },
  "大": { definition: "big; large", pinyin: ["dà"], radical: "大", radicalMeaning: "big" },
  "小": { definition: "small", pinyin: ["xiǎo"], radical: "小", radicalMeaning: "small" },
  "日": { definition: "sun; day", pinyin: ["rì"], radical: "日", radicalMeaning: "sun" },
  "月": { definition: "moon; month", pinyin: ["yuè"], radical: "月", radicalMeaning: "moon" },
};

export function getDictionaryEntry(character) {
  const entry = entries[character] ?? {
    definition: "No local definition yet",
    pinyin: [],
    radical: "",
    radicalMeaning: "",
  };

  return {
    character,
    ...entry,
    zhuyin: entry.pinyin.map(pinyinToZhuyin),
  };
}

export async function fetchDictionaryEntry(character) {
  const localEntry = getDictionaryEntry(character);
  if (localEntry.pinyin.length > 0) return localEntry;

  const dictionaryResponse = await fetch(`https://mandarinminutes.com/dictionary/${encodeURIComponent(character)}`);
  const text = await dictionaryResponse.text();
  if (!text) return localEntry;

  const remoteEntry = JSON.parse(text);
  let radicalMeaning = "";
  if (remoteEntry.radical) {
    const radicalResponse = await fetch(
      `https://mandarinminutes.com/radicalMeaning/${encodeURIComponent(remoteEntry.radical)}`,
    );
    const radicalText = await radicalResponse.text();
    radicalMeaning = radicalText ? JSON.parse(radicalText).radicalMeaning ?? "" : "";
  }

  return {
    character,
    definition: remoteEntry.definition ?? localEntry.definition,
    pinyin: remoteEntry.pinyin ?? [],
    radical: remoteEntry.radical ?? "",
    radicalMeaning,
    zhuyin: (remoteEntry.pinyin ?? []).map(pinyinToZhuyin),
  };
}

