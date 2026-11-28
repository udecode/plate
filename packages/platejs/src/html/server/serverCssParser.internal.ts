export type StyleEntry = {
  important: boolean;
  value: string;
};

type CssToken = Readonly<{
  end: number;
  start: number;
  text: string;
}>;

type EntryWriter = Readonly<{
  remove: (name: string) => void;
  write: (name: string, value: string) => void;
}>;

const STANDARD_PROPERTY_RE = /^-?[a-z][a-z0-9-]*$/;
const CSS_NUMBER_RE = /^\+?(?:\d+|\d*\.\d+)(?:e[+-]?\d+)?$/i;
const CSS_LENGTH_OR_PERCENT_RE =
  /^\+?(?:\d+|\d*\.\d+)(?:e[+-]?\d+)?(?:%|px|pt|pc|in|cm|mm|q|em|rem|ex|rex|ch|rch|cap|rcap|ic|ric|lh|rlh|vw|vh|vi|vb|vmin|vmax|svw|svh|lvw|lvh|dvw|dvh|cqw|cqh|cqi|cqb|cqmin|cqmax)$/i;
const CSS_ANGLE_RE =
  /^[+-]?(?:\d+|\d*\.\d+)(?:e[+-]?\d+)?(?:deg|grad|rad|turn)$/i;
const CSS_MATH_FUNCTION_RE = /^(?:calc|min|max|clamp)\(/i;
const CSS_COLOR_FUNCTION_RE =
  /^(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|color-mix)\(/i;
const CSS_HEX_COLOR_RE = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;
const CSS_IMAGE_FUNCTION_RE =
  /^(?:url|linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient|repeating-conic-gradient|image|image-set)\(/i;
const ASCII_IDENT_RE = /^[a-z]+$/i;

const CSS_WIDE_KEYWORDS = new Set([
  'inherit',
  'initial',
  'revert',
  'revert-layer',
  'unset',
]);
const SYSTEM_FONT_KEYWORDS = new Set([
  'caption',
  'icon',
  'menu',
  'message-box',
  'small-caption',
  'status-bar',
]);
const FONT_SIZE_KEYWORDS = new Set([
  'large',
  'larger',
  'medium',
  'small',
  'smaller',
  'x-large',
  'x-small',
  'xx-large',
  'xx-small',
  'xxx-large',
]);
const FONT_STRETCH_KEYWORDS = new Set([
  'condensed',
  'expanded',
  'extra-condensed',
  'extra-expanded',
  'semi-condensed',
  'semi-expanded',
  'ultra-condensed',
  'ultra-expanded',
]);
export const FONT_LONGHANDS = [
  'font-style',
  'font-variant',
  'font-weight',
  'font-stretch',
  'font-size',
  'line-height',
  'font-family',
] as const;
export const LIST_STYLE_LONGHANDS = [
  'list-style-type',
  'list-style-position',
  'list-style-image',
] as const;
const NON_COLOR_BACKGROUND_KEYWORDS = new Set([
  'auto',
  'border-box',
  'bottom',
  'center',
  'contain',
  'content-box',
  'cover',
  'fixed',
  'left',
  'local',
  'no-repeat',
  'none',
  'padding-box',
  'repeat',
  'repeat-x',
  'repeat-y',
  'right',
  'round',
  'scroll',
  'space',
  'text',
  'top',
]);
const LOWERCASE_VALUE_PROPERTIES = new Set([
  'display',
  'font-stretch',
  'font-style',
  'font-variant',
  'font-weight',
  'list-style-position',
  'text-align',
  'text-decoration',
  'text-decoration-line',
  'vertical-align',
  'white-space',
]);

const isWhitespace = (code: number) =>
  code === 0x20 ||
  code === 0x09 ||
  code === 0x0a ||
  code === 0x0c ||
  code === 0x0d;

export const normalizeCssPropertyName = (rawName: string): string | null => {
  const trimmed = rawName.trim();

  if (trimmed.startsWith('--')) {
    return trimmed.length > 2 && !/\s/.test(trimmed) ? trimmed : null;
  }

  const lower = trimmed.toLowerCase();

  return STANDARD_PROPERTY_RE.test(lower) ? lower : null;
};

export const stripCommentsAndSplitDeclarations = (
  cssText: string
): string[] => {
  const declarations: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let parenDepth = 0;
  let bracketDepth = 0;
  let braceDepth = 0;
  let index = 0;

  while (index < cssText.length) {
    const ch = cssText[index];

    if (quote !== null) {
      current += ch;
      if (ch === '\\' && index + 1 < cssText.length) {
        current += cssText[index + 1];
        index += 2;
        continue;
      }
      if (ch === quote) quote = null;
      index += 1;
      continue;
    }

    if (ch === '/' && cssText[index + 1] === '*') {
      const end = cssText.indexOf('*/', index + 2);

      current += ' ';
      index = end === -1 ? cssText.length : end + 2;
      continue;
    }

    if (ch === '\\' && index + 1 < cssText.length) {
      current += ch + cssText[index + 1];
      index += 2;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      index += 1;
      continue;
    }

    if (ch === '(') parenDepth += 1;
    else if (ch === ')' && parenDepth > 0) parenDepth -= 1;
    else if (ch === '[') bracketDepth += 1;
    else if (ch === ']' && bracketDepth > 0) bracketDepth -= 1;
    else if (ch === '{') braceDepth += 1;
    else if (ch === '}' && braceDepth > 0) braceDepth -= 1;

    if (
      ch === ';' &&
      parenDepth === 0 &&
      bracketDepth === 0 &&
      braceDepth === 0
    ) {
      if (current.trim()) declarations.push(current);
      current = '';
      index += 1;
      continue;
    }

    current += ch;
    index += 1;
  }

  if (current.trim()) declarations.push(current);

  return declarations;
};

const scanTopLevel = (
  value: string,
  onChar: (ch: string, index: number) => void
) => {
  let quote: '"' | "'" | null = null;
  let parenDepth = 0;
  let bracketDepth = 0;
  let braceDepth = 0;

  for (let index = 0; index < value.length; index += 1) {
    const ch = value[index];

    if (quote !== null) {
      if (ch === '\\') index += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '\\') {
      index += 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === '(') parenDepth += 1;
    else if (ch === ')' && parenDepth > 0) parenDepth -= 1;
    else if (ch === '[') bracketDepth += 1;
    else if (ch === ']' && bracketDepth > 0) bracketDepth -= 1;
    else if (ch === '{') braceDepth += 1;
    else if (ch === '}' && braceDepth > 0) braceDepth -= 1;
    else if (parenDepth === 0 && bracketDepth === 0 && braceDepth === 0) {
      onChar(ch, index);
    }
  }
};

export const findLastTopLevelBang = (value: string): number => {
  let lastBang = -1;

  scanTopLevel(value, (ch, index) => {
    if (ch === '!') lastBang = index;
  });

  return lastBang;
};

const splitTopLevelComma = (value: string): string[] => {
  const parts: string[] = [];
  let start = 0;

  scanTopLevel(value, (ch, index) => {
    if (ch === ',') {
      parts.push(value.slice(start, index).trim());
      start = index + 1;
    }
  });
  parts.push(value.slice(start).trim());

  return parts;
};

const tokenizeTopLevel = (value: string, splitSlash = false): CssToken[] => {
  const tokens: CssToken[] = [];
  let index = 0;

  while (index < value.length) {
    while (index < value.length && isWhitespace(value.charCodeAt(index))) {
      index += 1;
    }
    if (index >= value.length) break;

    if (splitSlash && value[index] === '/') {
      tokens.push({ end: index + 1, start: index, text: '/' });
      index += 1;
      continue;
    }

    const start = index;
    let quote: '"' | "'" | null = null;
    let parenDepth = 0;
    let bracketDepth = 0;

    while (index < value.length) {
      const ch = value[index];

      if (quote !== null) {
        if (ch === '\\' && index + 1 < value.length) {
          index += 2;
          continue;
        }
        if (ch === quote) quote = null;
        index += 1;
        continue;
      }

      if (ch === '\\' && index + 1 < value.length) {
        index += 2;
        continue;
      }
      if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '(') parenDepth += 1;
      else if (ch === ')' && parenDepth > 0) parenDepth -= 1;
      else if (ch === '[') bracketDepth += 1;
      else if (ch === ']' && bracketDepth > 0) bracketDepth -= 1;
      else if (
        parenDepth === 0 &&
        bracketDepth === 0 &&
        (isWhitespace(ch.charCodeAt(0)) || (splitSlash && ch === '/'))
      ) {
        break;
      }

      index += 1;
    }

    tokens.push({ end: index, start, text: value.slice(start, index) });
  }

  return tokens;
};

const isFontWeightNumber = (token: string): boolean => {
  if (!CSS_NUMBER_RE.test(token)) return false;
  const weight = Number(token);

  return weight >= 1 && weight <= 1000;
};

const isFontSizeToken = (token: string): boolean => {
  const lower = token.toLowerCase();

  return (
    lower === '0' ||
    FONT_SIZE_KEYWORDS.has(lower) ||
    CSS_LENGTH_OR_PERCENT_RE.test(token) ||
    CSS_MATH_FUNCTION_RE.test(token)
  );
};

const isLineHeightToken = (token: string): boolean =>
  token.toLowerCase() === 'normal' ||
  CSS_NUMBER_RE.test(token) ||
  CSS_LENGTH_OR_PERCENT_RE.test(token) ||
  CSS_MATH_FUNCTION_RE.test(token);

const expandFontShorthand = (value: string, writer: EntryWriter) => {
  const lower = value.toLowerCase();

  if (CSS_WIDE_KEYWORDS.has(lower)) {
    for (const longhand of FONT_LONGHANDS) writer.write(longhand, lower);
    writer.remove('font');

    return;
  }
  if (SYSTEM_FONT_KEYWORDS.has(lower)) {
    for (const longhand of FONT_LONGHANDS) writer.remove(longhand);
    writer.write('font', lower);

    return;
  }

  const tokens = tokenizeTopLevel(value, true);

  if (tokens.length < 2) return;

  let fontStyle: string | undefined;
  let fontVariant: string | undefined;
  let fontWeight: string | undefined;
  let fontStretch: string | undefined;
  let normalCount = 0;
  let cursor = 0;

  while (cursor < tokens.length) {
    const token = tokens[cursor].text;
    const tokenLower = token.toLowerCase();

    if (tokenLower === 'normal') {
      normalCount += 1;
      cursor += 1;
    } else if (tokenLower === 'italic' && fontStyle === undefined) {
      fontStyle = 'italic';
      cursor += 1;
    } else if (tokenLower === 'oblique' && fontStyle === undefined) {
      const next = tokens[cursor + 1]?.text;

      if (next && CSS_ANGLE_RE.test(next)) {
        fontStyle = `oblique ${next.toLowerCase()}`;
        cursor += 2;
      } else {
        fontStyle = 'oblique';
        cursor += 1;
      }
    } else if (tokenLower === 'small-caps' && fontVariant === undefined) {
      fontVariant = 'small-caps';
      cursor += 1;
    } else if (
      fontWeight === undefined &&
      (tokenLower === 'bold' ||
        tokenLower === 'bolder' ||
        tokenLower === 'lighter' ||
        isFontWeightNumber(token))
    ) {
      fontWeight = tokenLower;
      cursor += 1;
    } else if (
      FONT_STRETCH_KEYWORDS.has(tokenLower) &&
      fontStretch === undefined
    ) {
      fontStretch = tokenLower;
      cursor += 1;
    } else {
      break;
    }
  }

  const unsetSlots =
    (fontStyle === undefined ? 1 : 0) +
    (fontVariant === undefined ? 1 : 0) +
    (fontWeight === undefined ? 1 : 0) +
    (fontStretch === undefined ? 1 : 0);

  if (normalCount > unsetSlots) return;

  const sizeToken = tokens[cursor];

  if (!sizeToken || !isFontSizeToken(sizeToken.text)) return;
  cursor += 1;

  let lineHeight = 'normal';
  let familyStart = sizeToken.end;

  if (tokens[cursor]?.text === '/') {
    const lineHeightToken = tokens[cursor + 1];

    if (!lineHeightToken || !isLineHeightToken(lineHeightToken.text)) return;
    lineHeight =
      lineHeightToken.text.toLowerCase() === 'normal'
        ? 'normal'
        : lineHeightToken.text;
    familyStart = lineHeightToken.end;
  }

  const fontFamily = value.slice(familyStart).trim();

  if (!fontFamily || fontFamily.startsWith('/')) return;

  writer.write('font-style', fontStyle ?? 'normal');
  writer.write('font-variant', fontVariant ?? 'normal');
  writer.write('font-weight', fontWeight ?? 'normal');
  writer.write('font-stretch', fontStretch ?? 'normal');
  writer.write('font-size', sizeToken.text);
  writer.write('line-height', lineHeight);
  writer.write('font-family', fontFamily);
  writer.remove('font');
};

const expandBoxShorthand = (
  prefix: 'margin' | 'padding',
  value: string,
  writer: EntryWriter
) => {
  const lower = value.toLowerCase();

  if (CSS_WIDE_KEYWORDS.has(lower)) {
    for (const side of ['top', 'right', 'bottom', 'left'] as const) {
      writer.write(`${prefix}-${side}`, lower);
    }

    return;
  }

  const tokens = tokenizeTopLevel(value);

  if (tokens.length === 0 || tokens.length > 4) return;

  const [top, right = top, bottom = top, left = right] = tokens.map(
    (token) => token.text
  );

  writer.write(`${prefix}-top`, top);
  writer.write(`${prefix}-right`, right);
  writer.write(`${prefix}-bottom`, bottom);
  writer.write(`${prefix}-left`, left);
};

const expandInlineAxisShorthand = (
  prefix: 'margin-inline' | 'padding-inline',
  value: string,
  writer: EntryWriter
) => {
  const lower = value.toLowerCase();

  if (CSS_WIDE_KEYWORDS.has(lower)) {
    writer.write(`${prefix}-start`, lower);
    writer.write(`${prefix}-end`, lower);

    return;
  }

  const tokens = tokenizeTopLevel(value);

  if (tokens.length === 0 || tokens.length > 2) return;

  const [start, end = start] = tokens.map((token) => token.text);

  writer.write(`${prefix}-start`, start);
  writer.write(`${prefix}-end`, end);
};

const expandListStyleShorthand = (value: string, writer: EntryWriter) => {
  const lower = value.toLowerCase();

  if (CSS_WIDE_KEYWORDS.has(lower)) {
    for (const longhand of LIST_STYLE_LONGHANDS) writer.write(longhand, lower);

    return;
  }

  const tokens = tokenizeTopLevel(value);

  if (tokens.length === 0 || tokens.length > 3) return;

  let position: string | undefined;
  let image: string | undefined;
  let type: string | undefined;
  let noneCount = 0;

  for (const { text } of tokens) {
    const tokenLower = text.toLowerCase();

    if (tokenLower === 'none') {
      noneCount += 1;
    } else if (
      (tokenLower === 'inside' || tokenLower === 'outside') &&
      position === undefined
    ) {
      position = tokenLower;
    } else if (CSS_IMAGE_FUNCTION_RE.test(text) && image === undefined) {
      image = text;
    } else if (type === undefined) {
      type = text.startsWith('"') || text.startsWith("'") ? text : tokenLower;
    } else {
      return;
    }
  }

  if (noneCount > 2) return;
  if (noneCount === 2) {
    if (type !== undefined || image !== undefined) return;
    type = 'none';
    image = 'none';
  } else if (noneCount === 1) {
    if (type !== undefined && image !== undefined) return;
    if (type === undefined && image === undefined) {
      type = 'none';
      image = 'none';
    } else if (type === undefined) {
      type = 'none';
    } else {
      image = 'none';
    }
  }

  if (type !== undefined) writer.write('list-style-type', type);
  else writer.remove('list-style-type');
  if (position !== undefined) writer.write('list-style-position', position);
  else writer.remove('list-style-position');
  if (image !== undefined) writer.write('list-style-image', image);
  else writer.remove('list-style-image');
};

const isBackgroundColorToken = (token: string): boolean => {
  if (CSS_HEX_COLOR_RE.test(token) || CSS_COLOR_FUNCTION_RE.test(token)) {
    return true;
  }

  const lower = token.toLowerCase();

  return (
    lower === 'transparent' ||
    lower === 'currentcolor' ||
    (ASCII_IDENT_RE.test(token) &&
      !NON_COLOR_BACKGROUND_KEYWORDS.has(lower) &&
      !CSS_WIDE_KEYWORDS.has(lower))
  );
};

const expandBackgroundShorthand = (value: string, writer: EntryWriter) => {
  const lower = value.toLowerCase();

  if (CSS_WIDE_KEYWORDS.has(lower)) {
    writer.write('background-color', lower);
    writer.remove('background');

    return;
  }

  const layers = splitTopLevelComma(value);
  const finalLayer = layers.at(-1) ?? '';
  const tokens = tokenizeTopLevel(finalLayer, true);
  let color: string | undefined;

  for (const { text } of tokens) {
    if (!isBackgroundColorToken(text)) continue;
    if (color !== undefined) return;
    color = text;
  }

  if (color !== undefined) {
    writer.write('background-color', color);
    if (layers.length === 1 && tokens.length === 1) writer.remove('background');
    else writer.write('background', value);
  } else {
    writer.remove('background-color');
    writer.write('background', value);
  }
};

const normalizeStoredValue = (name: string, value: string): string => {
  if (value.toLowerCase().includes('var(')) return value;
  if (LOWERCASE_VALUE_PROPERTIES.has(name)) return value.toLowerCase();
  if (
    name === 'list-style-type' &&
    !value.startsWith('"') &&
    !value.startsWith("'")
  ) {
    return value.toLowerCase();
  }

  return value;
};

export const applyCssDeclaration = (
  entries: Map<string, StyleEntry>,
  name: string,
  value: string,
  important: boolean,
  forceOverwrite: boolean
) => {
  const writer: EntryWriter = {
    remove: (key) => {
      if (!forceOverwrite && entries.get(key)?.important && !important) return;
      entries.delete(key);
    },
    write: (key, val) => {
      if (!forceOverwrite && entries.get(key)?.important && !important) return;
      entries.set(key, { important, value: val });
    },
  };

  if (name === 'font') expandFontShorthand(value, writer);
  else if (name === 'margin' || name === 'padding') {
    expandBoxShorthand(name, value, writer);
  } else if (name === 'margin-inline' || name === 'padding-inline') {
    expandInlineAxisShorthand(name, value, writer);
  } else if (name === 'list-style') expandListStyleShorthand(value, writer);
  else if (name === 'background') expandBackgroundShorthand(value, writer);
  else writer.write(name, normalizeStoredValue(name, value));
};

export const parseCssDeclarationsInto = (
  cssText: string,
  entries: Map<string, StyleEntry>
) => {
  entries.clear();

  for (const declaration of stripCommentsAndSplitDeclarations(cssText)) {
    const colon = declaration.indexOf(':');

    if (colon === -1) continue;

    const name = normalizeCssPropertyName(declaration.slice(0, colon));

    if (!name) continue;

    const rawValue = declaration.slice(colon + 1).trim();

    if (!rawValue) continue;

    const lastBang = findLastTopLevelBang(rawValue);
    let important = false;
    let value = rawValue;

    if (lastBang !== -1) {
      const suffix = rawValue
        .slice(lastBang + 1)
        .trim()
        .toLowerCase();

      if (suffix === 'important') {
        important = true;
        value = rawValue.slice(0, lastBang).trim();
      } else if (!name.startsWith('--')) {
        continue;
      }
    }

    if (!value) continue;

    applyCssDeclaration(entries, name, value, important, false);
  }
};

export const serializeCssEntries = (
  entries: ReadonlyMap<string, StyleEntry>
): string => {
  if (entries.size === 0) return '';

  const parts: string[] = [];

  for (const [name, entry] of entries) {
    parts.push(
      entry.important
        ? `${name}: ${entry.value} !important`
        : `${name}: ${entry.value}`
    );
  }

  return `${parts.join('; ')};`;
};
