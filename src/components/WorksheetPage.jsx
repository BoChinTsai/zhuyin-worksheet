import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { fetchDictionaryEntry, getDictionaryEntry } from "../data/dictionary.js";
import { cleanCharacters } from "../lib/chinese.js";
import { getContextualPronunciations } from "../lib/pronunciation.js";
import { StrokeGlyph, StrokeSequence, useCharacterStrokes } from "./StrokeSequence.jsx";

export function WorksheetPage({ config }) {
  const navigate = useNavigate();
  const characters = cleanCharacters(config.characters);
  const contextualPronunciations = getContextualPronunciations(config.characters);
  const pageLayout = getPageLayout(config);
  const pages = chunkCharacters(characters, pageLayout.itemsPerPage);
  const annotationSize = ["small", "medium", "large"].includes(config.annotationSize)
    ? config.annotationSize
    : "small";
  const strokeSize = ["small", "medium", "large"].includes(config.strokeSize)
    ? config.strokeSize
    : "small";
  const layoutMode = config.layoutMode === "compact" ? "compact" : "vertical";
  const pageOrientation = config.pageOrientation === "landscape" ? "landscape" : "portrait";

  return (
    <main className={`print-stage annotation-${annotationSize} stroke-${strokeSize} layout-${layoutMode} page-${pageOrientation}`}>
      <div className="print-toolbar">
        <button className="secondary-action" type="button" onClick={() => navigate("/")}>
          <ArrowLeft size={18} />
          Back
        </button>
        <button className="primary-action small" type="button" onClick={() => window.print()}>
          <Printer size={18} />
          列印預覽
        </button>
      </div>

      {pages.map((pageCharacters, pageIndex) => (
        <section className="sheet" key={pageIndex} style={{ "--unit-columns": pageLayout.columns }}>
          {pageIndex === 0 && (config.showOriginalText || config.showFullTranslation) && (
            <header className="sheet-header">
              {config.showOriginalText && <div className="original-text">{config.characters}</div>}
              {config.showFullTranslation && config.translation && <div className="full-translation">{config.translation}</div>}
            </header>
          )}

          <div className="sheet-content">
            {pageCharacters.map((character, index) => (
              <CharacterRow
                key={`${pageIndex}-${character}-${index}`}
                character={character}
                contextualPronunciation={contextualPronunciations[pageIndex * pageLayout.itemsPerPage + index]}
                config={config}
              />
            ))}
          </div>
          <footer className="sheet-footer">
            zhuyin worksheet · page {pageIndex + 1} / {pages.length}
          </footer>
        </section>
      ))}
    </main>
  );
}

function getPageLayout(config) {
  if (config.layoutMode === "compact") return getCompactPageLayout(config);
  return { columns: 1, itemsPerPage: getRowsPerPage(config) };
}

function getRowsPerPage(config) {
  const hasHeader = config.showOriginalText || (config.showFullTranslation && config.translation);
  const pronunciationMode = config.pronunciationMode ?? (config.showZhuyin ? "zhuyin" : "none");
  const hasMeta =
    pronunciationMode !== "none" || config.showRadicals || config.showSequence || config.showCharacterTranslation;
  const page = getA4Metrics(config);
  const boxWidthCm = page.contentWidthCm / (config.numPracticeBoxes + 1);
  const annotationExtraCm = {
    small: 0.98,
    medium: 1.28,
    large: 1.62,
  }[config.annotationSize] ?? 0.98;
  const pronunciationExtraCm = pronunciationMode === "both" ? 0.24 : 0;
  const sequenceExtraCm = config.showSequence
    ? { small: 0.45, medium: 0.65, large: 0.85 }[config.strokeSize] ?? 0.45
    : 0;
  const rowHeightCm = boxWidthCm + (hasMeta ? annotationExtraCm + pronunciationExtraCm + sequenceExtraCm : 0.12);
  const usableHeightCm = page.contentHeightCm - 0.55 - (hasHeader ? 1.5 : 0);
  return Math.max(1, Math.floor(usableHeightCm / rowHeightCm));
}

function getCompactPageLayout(config) {
  const hasHeader = config.showOriginalText || (config.showFullTranslation && config.translation);
  const pronunciationMode = config.pronunciationMode ?? (config.showZhuyin ? "zhuyin" : "none");
  const hasMeta =
    pronunciationMode !== "none" || config.showRadicals || config.showSequence || config.showCharacterTranslation;
  const gapCm = 0.35;
  const page = getA4Metrics(config);
  const usableWidthCm = page.contentWidthCm;
  const usableHeightCm = page.contentHeightCm - 0.55 - (hasHeader ? 1.5 : 0);
  const boxesPerUnit = config.numPracticeBoxes + 1;
  const minBoxWidthCm = boxesPerUnit <= 6 ? 1.25 : boxesPerUnit <= 9 ? 1.05 : 0.92;
  const maxColumns = Math.max(1, Math.floor((usableWidthCm + gapCm) / (boxesPerUnit * minBoxWidthCm + gapCm)));
  const columns = Math.min(config.pageOrientation === "landscape" ? 4 : 3, maxColumns);
  const unitWidthCm = (usableWidthCm - gapCm * (columns - 1)) / columns;
  const boxWidthCm = unitWidthCm / boxesPerUnit;
  const annotationExtraCm = {
    small: 0.82,
    medium: 1.05,
    large: 1.32,
  }[config.annotationSize] ?? 0.82;
  const pronunciationExtraCm = pronunciationMode === "both" ? 0.2 : 0;
  const sequenceExtraCm = config.showSequence
    ? { small: 0.45, medium: 0.65, large: 0.85 }[config.strokeSize] ?? 0.45
    : 0;
  const unitHeightCm = boxWidthCm + (hasMeta ? annotationExtraCm + pronunciationExtraCm + sequenceExtraCm : 0.12);
  const rows = Math.max(1, Math.floor(usableHeightCm / unitHeightCm));
  return { columns, itemsPerPage: Math.max(1, columns * rows) };
}

function getA4Metrics(config) {
  const landscape = config.pageOrientation === "landscape";
  const pageWidthCm = landscape ? 29.7 : 21;
  const pageHeightCm = landscape ? 21 : 29.7;
  const horizontalPaddingCm = 3;
  const verticalPaddingCm = 2.7;
  return {
    pageWidthCm,
    pageHeightCm,
    contentWidthCm: pageWidthCm - horizontalPaddingCm,
    contentHeightCm: pageHeightCm - verticalPaddingCm,
  };
}

function chunkCharacters(characters, size) {
  if (characters.length === 0) return [[]];
  const pages = [];
  for (let i = 0; i < characters.length; i += size) {
    pages.push(characters.slice(i, i + size));
  }
  return pages;
}

function CharacterRow({ character, contextualPronunciation, config }) {
  const [entry, setEntry] = useState(() => getDictionaryEntry(character));
  const pronunciationMode = config.pronunciationMode ?? (config.showZhuyin ? "zhuyin" : "none");
  const showMeta =
    pronunciationMode !== "none" || config.showRadicals || config.showSequence || config.showCharacterTranslation;

  useEffect(() => {
    let cancelled = false;
    setEntry(getDictionaryEntry(character));
    fetchDictionaryEntry(character)
      .then((nextEntry) => {
        if (!cancelled) setEntry(nextEntry);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [character]);

  return (
    <section className="character-section">
      {showMeta && (
        <div className="annotation-row">
          {pronunciationMode !== "none" && (
            <span className="pronunciation">
              {(pronunciationMode === "zhuyin" || pronunciationMode === "both") && (
                <span className="zhuyin">{(contextualPronunciation?.zhuyin ?? entry.zhuyin).join("  ")}</span>
              )}
              {(pronunciationMode === "pinyin" || pronunciationMode === "both") && (
                <span className="pinyin">{(contextualPronunciation?.pinyin ?? entry.pinyin).join("  ")}</span>
              )}
            </span>
          )}
          {config.showSequence && <StrokeSequence character={character} />}
          {config.showCharacterTranslation && (
            <span className="definition">
              <strong>{character}</strong>: {entry.definition}
            </span>
          )}
          {config.showRadicals && entry.radical && (
            <span className="radical">
              {entry.radical}: {entry.radicalMeaning}
            </span>
          )}
        </div>
      )}
      <div className="practice-row" style={{ gridTemplateColumns: `repeat(${config.numPracticeBoxes + 1}, 1fr)` }}>
        <PracticeBox character={character} config={config} opacity={0.3} />
        {Array.from({ length: config.numPracticeBoxes }).map((_, index) => (
          <PracticeBox
            key={index}
            character={getPracticeCharacter(character, index, config)}
            config={config}
            opacity={getPracticeOpacity(index, config)}
          />
        ))}
      </div>
    </section>
  );
}

function getPracticeCharacter(character, index, config) {
  if (config.showFadingGuides) return character;
  return index < config.numPracticeBoxes - config.numWhiteBoxes ? character : "";
}

function getPracticeOpacity(index, config) {
  if (!config.showFadingGuides) return 0;
  const guidedBoxes = Math.max(1, config.numPracticeBoxes);
  if (index >= guidedBoxes) return 0;
  if (guidedBoxes <= 1) return 0.16;
  const start = 0.22;
  const end = 0.04;
  return start - ((start - end) * index) / (guidedBoxes - 1);
}

function PracticeBox({ character, config, opacity }) {
  const strokes = useCharacterStrokes(character);
  const style = { "--character-opacity": opacity };

  return (
    <div className={`practice-box ${config.gridType === "mi" ? "mi-grid" : "tian-grid"}`} style={style}>
      {strokes.length > 0 ? (
        <StrokeGlyph strokes={strokes} className="practice-glyph faded-character" />
      ) : (
        <span className="faded-character" style={{ fontFamily: config.font }}>
          {character}
        </span>
      )}
    </div>
  );
}
