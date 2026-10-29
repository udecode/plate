import {
  type BoundedDocxPackage,
  MAMMOTH_VML_ELEMENTS,
  MAMMOTH_WORD_CONTAINERS,
} from '../../internal/docxPackage';
import { MARKER_END, MARKER_START } from '../../internal/markerCharacters';
import { wordAttribute } from '../../internal/reviewPart';
import type { DocxDiagnostic } from '../../internal/types';

const STRICT_WORD_NAMESPACE =
  'http://purl.oclc.org/ooxml/wordprocessingml/main';
// Mammoth reads both the transitional and the Strict namespaces.
const WORD_NAMESPACES = new Set([
  'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
  STRICT_WORD_NAMESPACE,
]);
const MARKUP_COMPATIBILITY_NAMESPACE =
  'http://schemas.openxmlformats.org/markup-compatibility/2006';
const VML_NAMESPACE = 'urn:schemas-microsoft-com:vml';
const SHAPE_NAMESPACE =
  'http://schemas.microsoft.com/office/word/2010/wordprocessingShape';
const DRAWING_NAMESPACES = new Set([
  'http://schemas.openxmlformats.org/drawingml/2006/main',
  'http://purl.oclc.org/ooxml/drawingml/main',
]);

type WordPart = 'word/comments.xml' | 'word/document.xml';

type WordFeature =
  | 'alignment'
  | 'background-color'
  | 'bold'
  | 'caps'
  | 'character-spacing'
  | 'code'
  | 'double-strike'
  | 'font-family'
  | 'font-size'
  | 'highlight'
  | 'indent'
  | 'italic'
  | 'kbd'
  | 'line-height'
  | 'small-caps'
  | 'strikethrough'
  | 'subscript'
  | 'superscript'
  | 'text-color'
  | 'underline';

const CARRIED_STYLES = new Map<string, WordFeature>([
  ['background-color', 'background-color'],
  ['color', 'text-color'],
  ['text-align', 'alignment'],
]);
const CARRIED_TAGS = new Map<string, WordFeature>([
  ['code', 'code'],
  ['em', 'italic'],
  ['kbd', 'kbd'],
  ['mark', 'highlight'],
  ['s', 'strikethrough'],
  ['strong', 'bold'],
  ['sub', 'subscript'],
  ['sup', 'superscript'],
  ['u', 'underline'],
]);
const QUOTE_TAG = 'blockquote';

export const DOCX_CARRIED_STYLES: ReadonlySet<string> = new Set(
  CARRIED_STYLES.keys()
);
export const DOCX_CARRIED_TAGS: ReadonlySet<string> = new Set([
  ...CARRIED_TAGS.keys(),
  QUOTE_TAG,
]);

type WordColor =
  | Readonly<{ hex: string; kind: 'value' }>
  | Readonly<{ kind: 'unset' }>
  | Readonly<{ kind: 'unsupported' }>;

const UNSET: WordColor = Object.freeze({ kind: 'unset' });
const UNSUPPORTED: WordColor = Object.freeze({ kind: 'unsupported' });
const HEX = /^[\da-f]{6}$/i;

const colorValue = (hex: string): WordColor =>
  Object.freeze({ hex: hex.toLowerCase(), kind: 'value' });

const HIGHLIGHT_COLORS = new Map([
  ['black', '000000'],
  ['blue', '0000ff'],
  ['cyan', '00ffff'],
  ['darkBlue', '000080'],
  ['darkCyan', '008080'],
  ['darkGray', '808080'],
  ['darkGreen', '008000'],
  ['darkMagenta', '800080'],
  ['darkRed', '800000'],
  ['darkYellow', '808000'],
  ['green', '00ff00'],
  ['lightGray', 'c0c0c0'],
  ['magenta', 'ff00ff'],
  ['red', 'ff0000'],
  ['white', 'ffffff'],
]);

const OFF_VALUES = new Set(['0', 'false', 'off']);
const DRAWN_ALIGNMENTS = new Map([
  ['both', 'justify'],
  ['center', 'center'],
  ['end', 'end'],
  ['right', 'right'],
]);
const UNSET_ALIGNMENTS = new Set(['left', 'start']);
const INDENT_ATTRIBUTES = [
  'end',
  'endChars',
  'firstLine',
  'firstLineChars',
  'hanging',
  'hangingChars',
  'left',
  'leftChars',
  'right',
  'rightChars',
  'start',
  'startChars',
];
const FILLS = new Set(['blipFill', 'gradFill', 'pattFill', 'solidFill']);
const MARKER_TOKENS = new RegExp(
  `${MARKER_START}[^${MARKER_END}]*${MARKER_END}`,
  'g'
);
const DIGIT_FIRST = MARKER_END.charCodeAt(0) + 1;
// U+F8FF is left out because Mammoth writes it for a Symbol font w:sym
// that no source holds as text.
const DIGIT_END = 0xf8_ff;
const SHORTEST_ELEMENT_LENGTH = '<a/>'.length;
const PRIVATE_USE_START = 0xe0_00;
const PRIVATE_USE_END = 0xf8_ff;
const LARGEST_CODE_POINT = 0x10_ff_ff;

const isContinuation = (byte: number | undefined) =>
  byte !== undefined && byte >= 0x80 && byte <= 0xbf;

const decimalOf = (byte: number) =>
  byte >= 0x30 && byte <= 0x39 ? byte - 0x30 : -1;

const hexOf = (byte: number) => {
  const decimal = decimalOf(byte);

  if (decimal !== -1) return decimal;
  const lower = byte | 0x20;

  return lower >= 0x61 && lower <= 0x66 ? lower - 0x57 : -1;
};

const isWordByte = (byte: number | undefined) =>
  byte !== undefined &&
  (decimalOf(byte) !== -1 ||
    ((byte | 0x20) >= 0x61 && (byte | 0x20) <= 0x7a) ||
    byte === 0x5f);

const reserveReadable = (bytes: Uint8Array, taken: Uint8Array) => {
  for (let at = 0; at < bytes.length;) {
    const byte = bytes[at];

    // 0xEE and 0xEF are never continuation bytes, so each starts a sequence.
    if (
      (byte === 0xee || byte === 0xef) &&
      isContinuation(bytes[at + 1]) &&
      isContinuation(bytes[at + 2])
    ) {
      const code =
        ((byte & 0x0f) << 12) |
        ((bytes[at + 1] & 0x3f) << 6) |
        (bytes[at + 2] & 0x3f);

      if (code <= PRIVATE_USE_END) taken[code - PRIVATE_USE_START] = 1;
      at += 3;
      continue;
    }
    if (byte !== 0x26 || bytes[at + 1] !== 0x23) {
      at += 1;
      continue;
    }
    const bodyStart = at + 2;
    const hex = (bytes[bodyStart] | 0x20) === 0x78;
    const digitsStart = hex ? bodyStart + 1 : bodyStart;
    let end = bodyStart;
    let spec = true;
    let value = 0;

    for (; isWordByte(bytes[end]); end++) {
      if (end < digitsStart || !spec) continue;
      const digit = hex ? hexOf(bytes[end]) : decimalOf(bytes[end]);

      value = value * (hex ? 16 : 10) + digit;
      spec = digit !== -1 && value <= LARGEST_CODE_POINT;
    }
    const closed = bytes[end] === 0x3b;

    if (closed && spec && end > digitsStart) {
      if (value >= PRIVATE_USE_START && value <= PRIVATE_USE_END) {
        taken[value - PRIVATE_USE_START] = 1;
      }
    } else if (closed && end - bodyStart > 4) {
      // xmldom reads a body as parseInt(body.replace('x', '0x')), and no body
      // of four or fewer bytes reaches U+E000.
      return false;
    }
    at = end;
  }

  return true;
};

const delimiterCodec = (entries: BoundedDocxPackage['entries']) => {
  const taken = new Uint8Array(PRIVATE_USE_END - PRIVATE_USE_START + 1);
  const transport = Array.from(entries.values()).every((bytes) =>
    reserveReadable(bytes, taken)
  );
  const digits: number[] = [];
  const digitOf = new Int32Array(DIGIT_END - DIGIT_FIRST).fill(-1);
  let ranges = '';

  for (let code = DIGIT_FIRST; code < DIGIT_END; code++) {
    if (taken[code - PRIVATE_USE_START]) continue;
    digitOf[code - DIGIT_FIRST] = digits.length;
    digits.push(code);
  }
  for (let at = 0; at < digits.length;) {
    let end = at;

    while (end + 1 < digits.length && digits[end + 1] === digits[end] + 1) {
      end += 1;
    }
    ranges += `\\u${digits[at].toString(16)}-\\u${digits[end].toString(16)}`;
    at = end + 1;
  }
  const base = digits.length;
  const mostRuns =
    ((entries.get('word/document.xml')?.length ?? 0) +
      (entries.get('word/comments.xml')?.length ?? 0)) /
    SHORTEST_ELEMENT_LENGTH;
  let width = 1;

  if (base > 1) while (base ** width < mostRuns) width += 1;

  return {
    capacity: transport && base > 1 ? base ** width : 0,
    delimiter: (identity: number) => {
      let value = identity;
      let text = '';

      for (let at = 0; at < width; at++) {
        text = String.fromCharCode(digits[value % base]) + text;
        value = Math.floor(value / base);
      }

      return text;
    },
    digitOf: (code: number) => digitOf[code - DIGIT_FIRST],
    // A tag, whose attribute values Mammoth escapes, or a run of digits.
    pattern: new RegExp(`<[^>]*>|[${ranges}]+`, 'g'),
    width,
    base,
  };
};

const attribute = (element: Element, name: string) =>
  wordAttribute(element, name) ||
  element.getAttributeNS(STRICT_WORD_NAMESPACE, name) ||
  null;

const isWord = (element: Element, name: string) =>
  WORD_NAMESPACES.has(element.namespaceURI ?? '') && element.localName === name;

// happy-dom's getElementsByTagNameNS finds no prefixed element.
const elementsOf = (node: Document | Element) =>
  Array.from(node.getElementsByTagName('*'));

const textElement = (run: Element, text: string) => {
  const element = run.ownerDocument.createElementNS(
    run.namespaceURI,
    run.prefix ? `${run.prefix}:t` : 't'
  );

  element.textContent = text;

  return element;
};

const removeConsumedColorsKeepingYellowHighlight = (
  color: Element | undefined,
  shading: Element | undefined,
  highlight: Element | undefined,
  highlightIsYellow: boolean
) => {
  color?.remove();
  shading?.remove();
  if (!highlightIsYellow) highlight?.remove();
};

const delimitRunPreferringOwnText = (
  run: Element,
  properties: Element,
  delimiter: string
) => {
  const first = properties.parentNode
    ? properties.nextElementSibling
    : run.firstElementChild;

  if (!first) run.append(textElement(run, delimiter));
  else if (isWord(first, 't')) {
    first.textContent = delimiter + (first.textContent ?? '');
  } else first.before(textElement(run, delimiter));
  const last = run.lastElementChild;

  if (last && isWord(last, 't')) last.textContent += delimiter;
  else run.append(textElement(run, delimiter));
};

const child = (element: Element | null | undefined, name: string) => {
  for (
    let candidate = element?.firstElementChild;
    candidate;
    candidate = candidate.nextElementSibling
  ) {
    if (isWord(candidate, name)) return candidate;
  }

  return undefined;
};

const wordChildren = (element: Element) => {
  const found: Partial<Record<string, Element>> = {};

  for (
    let candidate = element.firstElementChild;
    candidate;
    candidate = candidate.nextElementSibling
  ) {
    if (WORD_NAMESPACES.has(candidate.namespaceURI ?? '')) {
      found[candidate.localName] ??= candidate;
    }
  }

  return found;
};

const hasText = (text: Element) => {
  const content = text.textContent ?? '';

  return content.includes(MARKER_START)
    ? content.replace(MARKER_TOKENS, '') !== ''
    : content !== '';
};

const READ = 1;
const ALTERNATE = 2;
const CONTEXT = READ | ALTERNATE;
const COLLECTED = 4;
const LEAF = 8;
const TEXT = 16;
// Mammoth draws a w:sym only when its dingbat table maps it, a table this
// entry cannot import.
const SYMBOL = 32;

const MAMMOTH_READ_WORD_ELEMENTS = new Set([
  ...MAMMOTH_WORD_CONTAINERS,
  'comment',
  'comments',
]);
const MAMMOTH_TEXT_ELEMENTS = new Set([
  'noBreakHyphen',
  'softHyphen',
  'sym',
  't',
  'tab',
]);
const NO_PARAGRAPH_RUN_OR_OWNER_BELOW = new Set([
  'pPr',
  'rPr',
  'sectPr',
  'tblPr',
  'tcPr',
  'trPr',
]);

const isOn = (element: Element | undefined) =>
  element !== undefined && !OFF_VALUES.has(attribute(element, 'val') ?? '');

const readColor = (element: Element | undefined, name = 'val'): WordColor => {
  if (!element) return UNSET;
  const value = attribute(element, name);

  if (value && HEX.test(value)) return colorValue(value);
  if (
    (value === null || value === 'auto') &&
    !attribute(element, 'themeColor')
  ) {
    return UNSET;
  }

  return UNSUPPORTED;
};

const readShading = (element: Element | undefined): WordColor => {
  if (!element) return UNSET;
  const pattern = attribute(element, 'val');

  if (pattern === 'nil') return UNSET;
  if (pattern && pattern !== 'clear') return UNSUPPORTED;
  const fill = attribute(element, 'fill');

  if (fill && HEX.test(fill)) return colorValue(fill);
  if ((fill === null || fill === 'auto') && !attribute(element, 'themeFill')) {
    return UNSET;
  }

  return UNSUPPORTED;
};

const readHighlight = (
  element: Element | undefined
): WordColor | Readonly<{ kind: 'mark' }> => {
  const value = element ? attribute(element, 'val') : null;

  if (value === null || value === 'none') return UNSET;
  if (value === 'yellow') return Object.freeze({ kind: 'mark' });
  const hex = HIGHLIGHT_COLORS.get(value);

  return hex ? colorValue(hex) : UNSUPPORTED;
};

const isDrawnPage = (page: Element) =>
  readColor(page, 'color').kind !== 'unset' || page.children.length > 0;

const hasShading = (properties: Element | undefined) =>
  readShading(child(properties, 'shd')).kind !== 'unset';

const setsAnyShading = (style: Element) =>
  elementsOf(style).some(
    (shading) => isWord(shading, 'shd') && readShading(shading).kind !== 'unset'
  );

const relativeLuminance = (hex: string) => {
  const [red, green, blue] = [0, 2, 4].map((at) => {
    const channel = Number.parseInt(hex.slice(at, at + 2), 16) / 255;

    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const readableOnWhite = (hex: string) =>
  1.05 / (relativeLuminance(hex) + 0.05) >= 1.5;

const keepsRunColor = (hex: string, ownBackground: boolean) =>
  ownBackground || readableOnWhite(hex);

type CarriedRun = Readonly<{
  background?: string;
  color?: string;
}>;

type PaletteEntry = Readonly<{
  carried: CarriedRun;
  openingSpanTag: string;
}>;

type InstrumentOptions = Readonly<{
  align: (paragraph: Element, value: string) => void;
  isNumbered: (paragraph: Element) => boolean;
}>;

export const createWordFormatting = ({
  entries,
  styles,
}: Readonly<{
  entries: BoundedDocxPackage['entries'];
  styles: Document | undefined;
}>) => {
  const palette = new Map<string, PaletteEntry>();
  let codec: ReturnType<typeof delimiterCodec> | undefined;
  const builtCodec = () => (codec ??= delimiterCodec(entries));
  const runEntries: PaletteEntry[] = [];
  const runParts: WordPart[] = [];
  const dropped = new Map<WordPart, Map<WordFeature, number>>();
  const lostQuotes = new Map<WordPart, number>();
  const tableStyleFills = new Map<string, boolean>();

  const drop = (part: WordPart, feature: WordFeature, count = 1) => {
    const counts = dropped.get(part) ?? new Map<WordFeature, number>();

    counts.set(feature, (counts.get(feature) ?? 0) + count);
    dropped.set(part, counts);
  };

  const styleById = new Map(
    (styles ? elementsOf(styles) : []).flatMap((style) => {
      const id = isWord(style, 'style') && attribute(style, 'styleId');

      return id ? [[id, style] as const] : [];
    })
  );
  const styleSetsAnyShading = (id: string) => {
    const chain = new Map<string, Element>();
    let fills = false;
    let current: string | null = id;

    while (current !== null && !chain.has(current)) {
      const known = tableStyleFills.get(current);
      const style = styleById.get(current);

      if (known !== undefined) {
        fills = known;
        break;
      }
      if (!style) break;
      chain.set(current, style);
      const basedOn = child(style, 'basedOn');

      current = basedOn ? attribute(basedOn, 'val') : null;
    }
    for (const [link, style] of Array.from(chain).reverse()) {
      fills ||= setsAnyShading(style);
      tableStyleFills.set(link, fills);
    }

    return fills;
  };

  // A box's text box and its fallback are one box, owned by their
  // alternate content.
  const ownsBox = (alternate: Element) =>
    elementsOf(alternate).some(
      (shape) => isFilledBox(shape) && alternateOf(shape) === alternate
    );

  const ownsBackground = (element: Element, name: string) => {
    if (name === 'p') return hasShading(child(element, 'pPr'));
    if (name === 'tr') return hasShading(child(element, 'tblPrEx'));
    if (name === 'tc') return hasShading(child(element, 'tcPr'));
    if (name !== 'tbl') return false;
    const properties = child(element, 'tblPr');
    const tableStyle = child(properties, 'tblStyle');
    const style = tableStyle ? attribute(tableStyle, 'val') : null;

    return (
      hasShading(properties) || (style !== null && styleSetsAnyShading(style))
    );
  };

  const walkPart = (document: Document, part: WordPart) => {
    const root = document.documentElement;
    const backgroundOwners = new Set<Element>();
    const paragraphs: Element[] = [];
    const paragraphFlags: number[] = [];
    const runs: Element[] = [];
    const runFlags: number[] = [];
    const runParagraphs: number[] = [];
    const openFlagLists: number[][] = [];
    const openIndexes: number[] = [];
    const ancestorFlags: number[] = [];

    const closeCollected = () => {
      openFlagLists.pop();
      openIndexes.pop();
    };
    const innermostParagraph = () => {
      for (let at = openIndexes.length - 1; at >= 0; at--) {
        if (openFlagLists[at] === paragraphFlags) return openIndexes[at];
      }

      return -1;
    };
    const markInnermost = (flag: number) => {
      let paragraphMarked = false;
      let runMarked = false;

      for (
        let at = openIndexes.length - 1;
        at >= 0 && !(paragraphMarked && runMarked);
        at--
      ) {
        const isParagraph = openFlagLists[at] === paragraphFlags;

        if (isParagraph ? paragraphMarked : runMarked) continue;
        openFlagLists[at][openIndexes[at]] |= flag;
        if (isParagraph) paragraphMarked = true;
        else runMarked = true;
      }
    };

    if (part === 'word/document.xml' && isWord(root, 'document')) {
      for (const page of Array.from(root.children)) {
        if (isWord(page, 'background') && isDrawnPage(page)) {
          backgroundOwners.add(page);
        }
      }
    }
    const enter = (element: Element, context: number) => {
      const namespace = element.namespaceURI;
      const name = element.localName;
      let flags = context;

      // Mammoth skips the subtree of every element its body reader does not
      // read, such as w:fldSimple or mc:Choice.
      if (WORD_NAMESPACES.has(namespace ?? '')) {
        if (MAMMOTH_TEXT_ELEMENTS.has(name)) {
          if (!(context & READ)) return flags | LEAF;
          if (name === 'sym') markInnermost(SYMBOL);
          else if (name !== 't' || hasText(element)) markInnermost(TEXT);

          return flags | LEAF;
        }
        if (NO_PARAGRAPH_RUN_OR_OWNER_BELOW.has(name)) return flags | LEAF;
        if (!MAMMOTH_READ_WORD_ELEMENTS.has(name)) return flags & ~READ;
        if (!(context & READ)) return flags;
        if (name === 'p' || name === 'r') {
          const collected = name === 'p' ? paragraphs : runs;
          const collectedFlags = name === 'p' ? paragraphFlags : runFlags;

          if (name === 'r') runParagraphs.push(innermostParagraph());
          openFlagLists.push(collectedFlags);
          openIndexes.push(collected.length);
          collected.push(element);
          collectedFlags.push(0);
          flags |= COLLECTED;
        }
        if (ownsBackground(element, name)) backgroundOwners.add(element);

        return flags;
      }
      if (namespace === MARKUP_COMPATIBILITY_NAMESPACE) {
        if (name === 'Fallback') return flags;
        if (name !== 'AlternateContent') return flags & ~READ;
        if (ownsBox(element)) backgroundOwners.add(element);

        return flags | ALTERNATE;
      }
      if (!(context & ALTERNATE) && isFilledBox(element)) {
        backgroundOwners.add(element);
      }

      return namespace === VML_NAMESPACE && MAMMOTH_VML_ELEMENTS.has(name)
        ? flags
        : flags & ~READ;
    };
    let context = READ;
    let element: Element | null = root;

    while (element) {
      const flags = enter(element, context);
      const first: Element | null =
        flags & LEAF ? null : element.firstElementChild;

      if (first) {
        ancestorFlags.push(flags);
        context = flags & CONTEXT;
        element = first;
        continue;
      }
      if (flags & COLLECTED) closeCollected();
      while (element) {
        if (element === root) element = null;
        else if (element.nextElementSibling) {
          element = element.nextElementSibling;
          break;
        } else {
          element = element.parentElement;
          if ((ancestorFlags.pop() ?? 0) & COLLECTED) closeCollected();
          context = (ancestorFlags.at(-1) ?? READ) & CONTEXT;
        }
      }
    }

    return {
      backgroundOwners,
      paragraphFlags,
      paragraphs,
      runFlags,
      runParagraphs,
      runs,
    };
  };

  const admit = (carried: CarriedRun) => {
    if (runEntries.length >= builtCodec().capacity) return undefined;
    const signature = `${carried.color ?? ''}|${carried.background ?? ''}`;
    let entry = palette.get(signature);

    if (!entry) {
      const css = [
        carried.color && `color: #${carried.color}`,
        carried.background && `background-color: #${carried.background}`,
      ]
        .filter(Boolean)
        .join('; ');

      entry = Object.freeze({
        carried,
        openingSpanTag: `<span style="${css}">`,
      });
      palette.set(signature, entry);
    }

    return entry;
  };

  const dropCarried = ({ background, color }: CarriedRun, part: WordPart) => {
    if (color !== undefined) drop(part, 'text-color');
    if (background !== undefined) drop(part, 'background-color');
  };

  const instrumentRun = (
    run: Element,
    flags: number,
    paragraphFlags: number,
    part: WordPart
  ) => {
    const properties = child(run, 'rPr');

    if (!properties || !(flags & (TEXT | SYMBOL))) return;
    const {
      caps,
      color: colorElement,
      dstrike,
      highlight: highlightElement,
      rFonts: fonts,
      shd: shadingElement,
      smallCaps,
      spacing,
      sz,
    } = wordChildren(properties);

    if (sz) drop(part, 'font-size');
    if (
      fonts &&
      ['ascii', 'asciiTheme', 'hAnsi', 'hAnsiTheme'].some((name) =>
        attribute(fonts, name)
      )
    ) {
      drop(part, 'font-family');
    }
    if (isOn(caps)) drop(part, 'caps');
    if (isOn(smallCaps)) drop(part, 'small-caps');
    if (isOn(dstrike)) drop(part, 'double-strike');
    if (spacing && Number(attribute(spacing, 'val') ?? 0) !== 0) {
      drop(part, 'character-spacing');
    }

    const highlight = readHighlight(highlightElement);
    const shading = readShading(shadingElement);
    let mark = false;
    let background: string | undefined;

    // Word draws a highlight over the run's shading.
    if (highlight.kind === 'unset') {
      if (shading.kind === 'value') background = shading.hex;
      else if (shading.kind === 'unsupported') drop(part, 'background-color');
    } else {
      if (highlight.kind === 'mark') mark = true;
      else if (highlight.kind === 'value') background = highlight.hex;
      else drop(part, 'background-color');
      if (shading.kind !== 'unset') drop(part, 'background-color');
    }
    const color = readColor(colorElement);
    let carriedColor: string | undefined;

    if (color.kind === 'unsupported') {
      drop(part, 'text-color');
    } else if (color.kind === 'value') {
      if (keepsRunColor(color.hex, mark || background !== undefined)) {
        carriedColor = color.hex;
      } else {
        drop(part, 'text-color');
      }
    }
    if (carriedColor === undefined && background === undefined) return;
    const carried = { background, color: carriedColor };
    // Transport text would keep a paragraph Mammoth drops when its symbols
    // draw nothing.
    const entry =
      flags & TEXT || paragraphFlags & TEXT ? admit(carried) : undefined;

    if (!entry) {
      dropCarried(carried, part);

      return;
    }
    const delimiter = builtCodec().delimiter(runEntries.length);

    runEntries.push(entry);
    runParts.push(part);
    removeConsumedColorsKeepingYellowHighlight(
      colorElement,
      shadingElement,
      highlightElement,
      mark
    );
    if (!properties.firstElementChild) properties.remove();
    delimitRunPreferringOwnText(run, properties, delimiter);
  };

  const instrumentParagraph = (
    paragraph: Element,
    flags: number,
    part: WordPart,
    options: InstrumentOptions
  ) => {
    const properties = child(paragraph, 'pPr');

    if (!properties) return;
    const {
      ind: indent,
      jc: justification,
      spacing,
    } = wordChildren(properties);

    if (spacing && attribute(spacing, 'line') !== null) {
      drop(part, 'line-height');
    }
    if (
      indent &&
      INDENT_ATTRIBUTES.some(
        (name) => Number(attribute(indent, name) ?? 0) !== 0
      ) &&
      !options.isNumbered(paragraph)
    ) {
      drop(part, 'indent');
    }
    const value = justification ? attribute(justification, 'val') : null;

    if (value === null || UNSET_ALIGNMENTS.has(value)) return;
    if (!(flags & TEXT)) {
      if (flags & SYMBOL) drop(part, 'alignment');

      return;
    }
    const drawn = DRAWN_ALIGNMENTS.get(value);

    if (drawn) options.align(paragraph, drawn);
    else drop(part, 'alignment');
  };

  return Object.freeze({
    instrument: (
      document: Document,
      part: WordPart,
      options: InstrumentOptions
    ) => {
      const {
        backgroundOwners,
        paragraphFlags,
        paragraphs,
        runFlags,
        runParagraphs,
        runs,
      } = walkPart(document, part);

      if (backgroundOwners.size > 0) {
        drop(part, 'background-color', backgroundOwners.size);
      }
      for (const [index, paragraph] of paragraphs.entries()) {
        instrumentParagraph(paragraph, paragraphFlags[index], part, options);
      }
      for (const [index, run] of runs.entries()) {
        instrumentRun(
          run,
          runFlags[index],
          paragraphFlags[runParagraphs[index]] ?? 0,
          part
        );
      }
    },
    restoreHtml: (html: string) => {
      if (!codec || runEntries.length === 0) return html;
      const { base, digitOf, pattern, width } = codec;
      const identities: number[] = [];
      const frames: number[] = [];
      const starts: number[] = [];
      const ends: number[] = [];
      const seen = new Uint8Array(runEntries.length);
      const openElementFrames = [0];
      let nextFrameNumber = 1;

      for (const match of html.matchAll(pattern)) {
        const token = match[0];

        if (token.startsWith('<')) {
          if (token.startsWith('</')) openElementFrames.pop();
          else if (!token.endsWith('/>')) {
            openElementFrames.push(nextFrameNumber);
            nextFrameNumber += 1;
          }
          continue;
        }
        const frame = openElementFrames.at(-1) ?? 0;

        for (let at = 0; at < token.length; at += width) {
          let identity = -1;

          if (at + width <= token.length) {
            identity = 0;
            for (let digit = at; digit < at + width; digit++) {
              identity = identity * base + digitOf(token.charCodeAt(digit));
            }
            if (identity < runEntries.length) {
              seen[identity] = Math.min(seen[identity] + 1, 3);
            } else identity = -1;
          }
          identities.push(identity);
          frames.push(frame);
          starts.push(match.index + at);
          ends.push(match.index + Math.min(at + width, token.length));
        }
      }
      const opensPair = (at: number) => {
        const identity = identities[at];

        return (
          identity !== -1 &&
          seen[identity] === 2 &&
          identities[at + 1] === identity &&
          frames[at + 1] === frames[at]
        );
      };
      const restored: string[] = [];
      const received = new Uint8Array(runEntries.length);
      let last = 0;

      for (let at = 0; at < identities.length; at++) {
        restored.push(html.slice(last, starts[at]));
        last = ends[at];
        if (!opensPair(at)) continue;
        const identity = identities[at];

        received[identity] = 1;
        restored.push(
          runEntries[identity].openingSpanTag,
          html.slice(last, starts[at + 1]),
          '</span>'
        );
        at += 1;
        last = ends[at];
      }
      restored.push(html.slice(last));
      for (let identity = 0; identity < runEntries.length; identity++) {
        if (!received[identity]) {
          dropCarried(runEntries[identity].carried, runParts[identity]);
        }
      }

      return restored.join('');
    },
    unclaimed: (name: string, part: WordPart) => {
      if (name === QUOTE_TAG) {
        lostQuotes.set(part, (lostQuotes.get(part) ?? 0) + 1);

        return;
      }
      const feature = CARRIED_STYLES.get(name) ?? CARRIED_TAGS.get(name);

      if (feature) drop(part, feature);
    },
    diagnostics: (): DocxDiagnostic[] => [
      ...Array.from(lostQuotes, ([part, count]) =>
        Array.from({ length: count }, () =>
          Object.freeze({
            action: 'unwrapped' as const,
            code: 'unsupported-content' as const,
            feature: 'quote',
            impact: 'lossy' as const,
            message:
              'A Word quote was imported as its paragraphs, because no installed mapping reads a quote.',
            part,
            severity: 'warning' as const,
          })
        )
      ).flat(),
      ...Array.from(dropped, ([part, counts]) =>
        Array.from(counts, ([feature, count]) =>
          Object.freeze({
            code: 'property-dropped' as const,
            count,
            feature,
            impact: 'lossy' as const,
            message: `DOCX import dropped ${feature.replaceAll('-', ' ')} ${count} time${count === 1 ? '' : 's'}.`,
            part,
            severity: 'warning' as const,
          })
        )
      ).flat(),
    ],
  });
};

const alternateOf = (element: Element) => {
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (
      node.namespaceURI === MARKUP_COMPATIBILITY_NAMESPACE &&
      node.localName === 'AlternateContent'
    ) {
      return node;
    }
  }

  return undefined;
};

const isFilledBox = (shape: Element) =>
  shape.namespaceURI === VML_NAMESPACE
    ? Array.from(shape.children).some(
        (candidate) =>
          candidate.namespaceURI === VML_NAMESPACE &&
          candidate.localName === 'textbox'
      ) && vmlFilled(shape)
    : shape.namespaceURI === SHAPE_NAMESPACE &&
      shape.localName === 'wsp' &&
      Array.from(shape.children).some(
        (candidate) => candidate.localName === 'txbx'
      ) &&
      Array.from(
        Array.from(shape.children).find(
          (candidate) => candidate.localName === 'spPr'
        )?.children ?? []
      ).some(
        (fill) =>
          DRAWING_NAMESPACES.has(fill.namespaceURI ?? '') &&
          FILLS.has(fill.localName)
      );

const vmlFilled = (shape: Element) => {
  if (['f', 'false'].includes(shape.getAttribute('filled') ?? '')) return false;

  return (
    shape.hasAttribute('fillcolor') ||
    Array.from(shape.children).some(
      (candidate) =>
        candidate.namespaceURI === VML_NAMESPACE &&
        candidate.localName === 'fill' &&
        candidate.hasAttribute('color')
    )
  );
};
