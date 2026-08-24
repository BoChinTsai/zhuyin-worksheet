export const DEFAULT_CONFIG = {
  characters: "",
  font: "KaiTi",
  gridType: "tian",
  pageOrientation: "portrait",
  layoutMode: "vertical",
  pronunciationMode: "zhuyin",
  showZhuyin: true,
  showRadicals: true,
  showSequence: true,
  showCharacterTranslation: true,
  showFullTranslation: true,
  showOriginalText: true,
  showFadingGuides: true,
  numWhiteBoxes: 3,
  numPracticeBoxes: 10,
  annotationSize: "small",
  strokeSize: "small",
  translation: "",
};

const boolParam = (params, key, fallback) => {
  const value = params.get(key);
  if (value == null) return fallback;
  return value === "true";
};

const intParam = (params, key, fallback) => {
  const value = Number.parseInt(params.get(key) ?? "", 10);
  return Number.isFinite(value) ? value : fallback;
};

export function parseWorksheetParams(params) {
  const legacyShowZhuyin = boolParam(params, "showZhuyin", DEFAULT_CONFIG.showZhuyin);
  const pronunciationMode =
    params.get("pronunciationMode") || params.get("pronunciation") || (legacyShowZhuyin ? "zhuyin" : "none");

  return {
    characters: params.get("characters") ?? "",
    font: params.get("font") || DEFAULT_CONFIG.font,
    gridType: params.get("gridType") || DEFAULT_CONFIG.gridType,
    pageOrientation: params.get("pageOrientation") || DEFAULT_CONFIG.pageOrientation,
    layoutMode: params.get("layoutMode") || DEFAULT_CONFIG.layoutMode,
    pronunciationMode,
    showZhuyin: pronunciationMode !== "none",
    showRadicals: boolParam(params, "showRadicals", DEFAULT_CONFIG.showRadicals),
    showSequence: boolParam(params, "showSequence", DEFAULT_CONFIG.showSequence),
    showCharacterTranslation: boolParam(
      params,
      "showCharacterTranslation",
      DEFAULT_CONFIG.showCharacterTranslation,
    ),
    showFullTranslation: boolParam(params, "showFullTranslation", DEFAULT_CONFIG.showFullTranslation),
    showOriginalText: boolParam(params, "showOriginalText", DEFAULT_CONFIG.showOriginalText),
    showFadingGuides: boolParam(params, "showFadingGuides", DEFAULT_CONFIG.showFadingGuides),
    numWhiteBoxes: intParam(params, "numWhiteBoxes", DEFAULT_CONFIG.numWhiteBoxes),
    numPracticeBoxes: intParam(params, "numPracticeBoxes", DEFAULT_CONFIG.numPracticeBoxes),
    annotationSize: params.get("annotationSize") || DEFAULT_CONFIG.annotationSize,
    strokeSize: params.get("strokeSize") || DEFAULT_CONFIG.strokeSize,
    translation: params.get("translation") ?? "",
  };
}

export function worksheetUrl(config) {
  const params = new URLSearchParams();
  params.set("view", "worksheet");
  params.set("characters", config.characters);
  params.set("font", config.font);
  params.set("gridType", config.gridType);
  params.set("pageOrientation", config.pageOrientation);
  params.set("layoutMode", config.layoutMode);
  params.set("pronunciationMode", config.pronunciationMode);
  params.set("showZhuyin", String(config.pronunciationMode !== "none"));
  params.set("showRadicals", String(config.showRadicals));
  params.set("showSequence", String(config.showSequence));
  params.set("showCharacterTranslation", String(config.showCharacterTranslation));
  params.set("showFullTranslation", String(config.showFullTranslation));
  params.set("showOriginalText", String(config.showOriginalText));
  params.set("showFadingGuides", String(config.showFadingGuides));
  params.set("numWhiteBoxes", String(config.numWhiteBoxes));
  params.set("numPracticeBoxes", String(config.numPracticeBoxes));
  params.set("annotationSize", config.annotationSize);
  params.set("strokeSize", config.strokeSize);
  params.set("translation", config.translation);
  return `/worksheet?${params.toString()}`;
}
