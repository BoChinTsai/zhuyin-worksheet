const MOE_STROKE_BASE_URL = `${import.meta.env.BASE_URL}strokes`;
const strokeCache = new Map();

export async function loadMoeStrokeData(character) {
  const codePoint = character.codePointAt(0);
  if (!codePoint) return [];

  const code = codePoint.toString(16).toUpperCase();
  if (strokeCache.has(code)) return strokeCache.get(code);

  const promise = fetch(`${MOE_STROKE_BASE_URL}/${code}.xml`)
    .then((response) => {
      if (!response.ok) return [];
      return response.text();
    })
    .then(parseMoeStrokeXml)
    .catch(() => []);

  strokeCache.set(code, promise);
  return promise;
}

function parseMoeStrokeXml(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  if (doc.querySelector("parsererror")) return [];

  return [...doc.querySelectorAll("Stroke > Outline")]
    .map((outline) => {
      const d = [...outline.children].map(commandFromElement).filter(Boolean).join(" ");
      return d ? { d, source: "moe" } : null;
    })
    .filter(Boolean);
}

function commandFromElement(element) {
  const x = numberAttr(element, "x");
  const y = numberAttr(element, "y");

  if (element.tagName === "MoveTo") return `M ${x} ${y}`;
  if (element.tagName === "LineTo") return `L ${x} ${y}`;

  if (element.tagName === "QuadTo") {
    const x1 = numberAttr(element, "x1");
    const y1 = numberAttr(element, "y1");
    const x2 = numberAttr(element, "x2");
    const y2 = numberAttr(element, "y2");
    return `Q ${x1} ${y1} ${x2} ${y2}`;
  }

  return "";
}

function numberAttr(element, name) {
  return Number.parseFloat(element.getAttribute(name) ?? "0");
}
