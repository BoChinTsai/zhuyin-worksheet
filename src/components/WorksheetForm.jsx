import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Sparkles } from "lucide-react";
import { DEFAULT_CONFIG, worksheetUrl } from "../lib/config.js";
import { cleanCharacters } from "../lib/chinese.js";

const sampleSentences = [
  {
    text: "午後的陽光灑進窗台，貓咪正慵懶地翻身午睡。",
    translation: "Afternoon sunlight spills onto the windowsill as the cat lazily rolls over for a nap.",
  },
  {
    text: "漫步在細雨綿綿的小徑，思緒隨風飄向了遠方。",
    translation: "Walking along a misty path, thoughts drift far away with the wind.",
  },
  {
    text: "翻開那本陳舊的筆記本，字裡行間滿是青春夢。",
    translation: "Opening that old notebook, every line is filled with youthful dreams.",
  },
];

export function WorksheetForm({ initialConfig = DEFAULT_CONFIG, preferStoredConfig = true }) {
  const navigate = useNavigate();
  const stored = window.localStorage.getItem("worksheetConfig");
  const [config, setConfig] = useState(() => {
    const storedConfig = stored ? JSON.parse(stored) : {};
    return preferStoredConfig
      ? { ...DEFAULT_CONFIG, ...storedConfig }
      : { ...DEFAULT_CONFIG, ...storedConfig, ...initialConfig };
  });
  const canGenerate = cleanCharacters(config.characters).length > 0;

  const update = (patch) => {
    const next = { ...config, ...patch };
    setConfig(next);
    window.localStorage.setItem("worksheetConfig", JSON.stringify(next));
  };

  const generate = () => {
    if (!canGenerate) return;
    navigate(worksheetUrl(config));
  };

  const surprise = () => {
    const next = sampleSentences[Math.floor(Math.random() * sampleSentences.length)];
    update({ characters: next.text, translation: next.translation });
  };

  return (
    <main className="app-shell">
      <section className="workspace-panel">
        <div className="brand-strip">
          <div>
            <p className="eyebrow">Zhuyin worksheet generator</p>
            <h1>注音練習紙</h1>
          </div>
          <button className="icon-button" type="button" onClick={surprise} title="Random sample sentence">
            <Sparkles size={20} />
          </button>
        </div>

        <label className="field-label" htmlFor="characters">
          今天我想寫
        </label>
        <textarea
          id="characters"
          value={config.characters}
          maxLength={1000}
          onChange={(event) => update({ characters: event.target.value })}
          placeholder="輸入想練習的中文..."
        />

        <div className="control-grid">
          <label>
            <span>Font</span>
            <select value={config.font} onChange={(event) => update({ font: event.target.value })}>
              <option value="KaiTi">KaiTi</option>
              <option value="serif">Serif fallback</option>
              <option value="sans-serif">Sans fallback</option>
            </select>
          </label>
          <label>
            <span>Grid</span>
            <select value={config.gridType} onChange={(event) => update({ gridType: event.target.value })}>
              <option value="tian">田字格</option>
              <option value="mi">米字格</option>
            </select>
          </label>
          <label>
            <span>Layout</span>
            <select value={config.layoutMode} onChange={(event) => update({ layoutMode: event.target.value })}>
              <option value="vertical">直向列</option>
              <option value="compact">橫向緊湊</option>
            </select>
          </label>
          <label>
            <span>Paper</span>
            <select value={config.pageOrientation} onChange={(event) => update({ pageOrientation: event.target.value })}>
              <option value="portrait">A4 直式</option>
              <option value="landscape">A4 橫式</option>
            </select>
          </label>
          <label>
            <span>Blank boxes</span>
            <input
              type="number"
              min="0"
              max={config.numPracticeBoxes}
              value={config.numWhiteBoxes}
              onChange={(event) => update({ numWhiteBoxes: Number(event.target.value) })}
            />
          </label>
          <label>
            <span>Practice boxes</span>
            <input
              type="number"
              min="5"
              max="15"
              value={config.numPracticeBoxes}
              onChange={(event) => update({ numPracticeBoxes: Number(event.target.value) })}
            />
          </label>
          <label>
            <span>Annotation size</span>
            <select value={config.annotationSize} onChange={(event) => update({ annotationSize: event.target.value })}>
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </label>
          <label>
            <span>Pronunciation</span>
            <select
              value={config.pronunciationMode}
              onChange={(event) =>
                update({
                  pronunciationMode: event.target.value,
                  showZhuyin: event.target.value !== "none",
                })
              }
            >
              <option value="zhuyin">注音</option>
              <option value="pinyin">拼音</option>
              <option value="both">注音 + 拼音</option>
              <option value="none">不顯示</option>
            </select>
          </label>
        </div>

        <div className="toggle-grid">
          <Toggle label="部首" checked={config.showRadicals} onChange={(showRadicals) => update({ showRadicals })} />
          <Toggle label="筆順" checked={config.showSequence} onChange={(showSequence) => update({ showSequence })} />
          <Toggle
            label="字義"
            checked={config.showCharacterTranslation}
            onChange={(showCharacterTranslation) => update({ showCharacterTranslation })}
          />
          <Toggle label="原文" checked={config.showOriginalText} onChange={(showOriginalText) => update({ showOriginalText })} />
          <Toggle
            label="全文翻譯"
            checked={config.showFullTranslation}
            onChange={(showFullTranslation) => update({ showFullTranslation })}
          />
          <Toggle
            label="漸淡提示"
            checked={config.showFadingGuides}
            onChange={(showFadingGuides) => update({ showFadingGuides })}
          />
        </div>

        <label className="field-label" htmlFor="translation">
          Translation
        </label>
        <input
          id="translation"
          value={config.translation}
          onChange={(event) => update({ translation: event.target.value })}
          placeholder="Optional full sentence translation"
        />

        <button className="primary-action" type="button" disabled={!canGenerate} onClick={generate}>
          <FileText size={20} />
          Generate worksheet
        </button>
      </section>
    </main>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

