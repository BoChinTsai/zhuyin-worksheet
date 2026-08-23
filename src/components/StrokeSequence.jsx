import { useEffect, useState } from "react";
import HanziWriter from "hanzi-writer";
import { loadMoeStrokeData } from "../lib/moeStrokes.js";

export function useCharacterStrokes(character) {
  const [strokes, setStrokes] = useState([]);

  useEffect(() => {
    if (!character) {
      setStrokes([]);
      return undefined;
    }
    let cancelled = false;
    HanziWriter.loadCharacterData(character)
      .then((data) => {
        if (cancelled) return;
        const hanziWriterStrokes = data.strokes ?? [];
        if (hanziWriterStrokes.length > 0) {
          setStrokes(hanziWriterStrokes);
          return;
        }
        loadMoeStrokeData(character).then((moeStrokes) => {
          if (!cancelled) setStrokes(moeStrokes);
        });
      })
      .catch(() => {
        loadMoeStrokeData(character).then((moeStrokes) => {
          if (!cancelled) setStrokes(moeStrokes);
        });
      });
    return () => {
      cancelled = true;
    };
  }, [character]);

  return strokes;
}

export function StrokeSequence({ character }) {
  const strokes = useCharacterStrokes(character);

  if (strokes.length === 0) return <span className="stroke-placeholder" />;

  return (
    <span className="stroke-sequence">
      {strokes.map((_, index) => (
        <StrokeGlyph key={`${character}-${index}`} strokes={strokes.slice(0, index + 1)} />
      ))}
    </span>
  );
}

export function StrokeGlyph({ strokes, className = "" }) {
  const isMoeStrokeData = strokes.some((stroke) => typeof stroke === "object" && stroke.source === "moe");

  if (isMoeStrokeData) {
    return (
      <svg className={className} viewBox="0 0 1024 1024" aria-hidden="true">
        {strokes.map((stroke, index) => (
          <path
            key={stroke.d}
            d={stroke.d}
            className={index === strokes.length - 1 ? "last-stroke" : "past-stroke"}
          />
        ))}
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 1024 1024" aria-hidden="true">
      <g transform="translate(0, 900) scale(1, -1)">
        {strokes.map((stroke, index) => (
          <path key={stroke} d={stroke} className={index === strokes.length - 1 ? "last-stroke" : "past-stroke"} />
        ))}
      </g>
    </svg>
  );
}
