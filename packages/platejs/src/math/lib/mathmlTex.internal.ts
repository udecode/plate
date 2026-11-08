import type { MathmlElementName } from '../../lib/plugins/html/htmlDom';
import {
  MATHML_TEX_ACCENTS,
  MATHML_TEX_ARROW_LABEL_SIGNATURE,
  MATHML_TEX_ARROWS,
  MATHML_TEX_ASCII_ITSELF,
  MATHML_TEX_CLASSES,
  MATHML_TEX_DELIMITER_SIZES,
  MATHML_TEX_DELIMITERS,
  MATHML_TEX_ENCLOSURES,
  MATHML_TEX_ENVIRONMENTS,
  MATHML_TEX_FONTS,
  MATHML_TEX_OPERATORS,
  MATHML_TEX_PADDING,
  MATHML_TEX_SIZES,
  MATHML_TEX_SPACES,
  MATHML_TEX_STYLE_EM_SCALES,
  MATHML_TEX_SYMBOLS,
  MATHML_TEX_TOKENS,
  withoutPrototype,
  type MathmlTexBySignature,
  type MathmlTexEnvironment,
  type MathmlTexName,
  type MathmlTexPick,
} from './mathmlTexSymbols.internal';

export type MathmlTexLoss =
  | 'color'
  | 'enclosure'
  | 'label'
  | 'size'
  | 'spacing'
  | 'stretch'
  | `maction <${string}>`
  | `symbol U+${string}`;

export type MathmlTexChoice = {
  readonly name: MathmlTexName;
  readonly others: readonly MathmlTexName[];
};

export type MathmlTex =
  | {
      readonly kind: 'approximate';
      readonly lost: readonly MathmlTexLoss[];
      readonly picks: readonly MathmlTexChoice[];
      readonly tex: string;
    }
  | {
      readonly kind: 'exact';
      readonly picks: readonly MathmlTexChoice[];
      readonly tex: string;
    }
  | { readonly element: Element; readonly kind: 'refused' };

type Context = {
  readonly block: boolean;
  readonly displayStyle: boolean;
  readonly lost: Set<MathmlTexLoss>;
  readonly picks: Map<MathmlTexName, MathmlTexChoice>;
  readonly emScale: number | undefined;
};

type Operator = {
  readonly displayLimits: boolean;
  readonly limitsTex: string;
  readonly tex: string;
};

type Tex = {
  /** One `mo` token, which braces would give the spacing of a braced operator. */
  readonly bare?: boolean;
  readonly operator?: Operator;
  readonly positionalPair?: readonly [MathmlTexName, MathmlTexName];
  readonly tex: string;
  readonly unbraced?: string;
  readonly unit: boolean;
};

type MathmlRule = (element: Element, context: Context) => Tex;

class RefusalError extends Error {
  readonly element: Element;

  constructor(element: Element) {
    super(`<${element.localName}> has no TeX form`);
    this.name = 'RefusalError';
    this.element = element;
  }
}

const refuse = (element: Element): never => {
  throw new RefusalError(element);
};

const INERT_ATTRIBUTE = /^(?:xmlns(?::.*)?|id|data-.*|aria-.*|intent|arg)$/u;
const SINGLE_TOKEN = /^(?:\\[A-Za-z]+|\\[^A-Za-z]|[^\\{}\s])$/u;
const PRINTABLE = /^[\p{L}\p{N}\p{P}\p{S}]$/u;
const KATEX_COLOR = /^(?:#[\da-f]{3}|#[\da-f]{6}|[a-z]+)$/iu;
const INVISIBLE_OPERATOR = /^[\u2061-\u2064]$/u;
const FENCE_TEXT = new Set('()[]{}|‖∣∥⟨⟩⌈⌉⌊⌋⟦⟧⟮⟯⦃⦄');
const LARGE_OPERATOR_TEXT = new Set('∑∏∐∫∬∭∮∯∰⋀⋁⋂⋃⨀⨁⨂⨄⨆');
const TALL_TAGS = new Set(['mfrac', 'mroot', 'msqrt', 'mtable']);
const OPENING_TEXT = new Set('([{⟨⌈⌊⟮⎰⟦⦃');
const CLOSING_TEXT = new Set(')]}⟩⌉⌋⟯⎱⟧⦄');
const POSITION_PAIRS = new Set(['\\lVert', '\\lvert']);
const PRESENTATION_ENCODING =
  /^(?:mathml-presentation|application\/mathml-presentation\+xml)$/iu;
const MATH_ALPHANUMERIC_LETTERS = [
  'bold',
  'italic',
  'bold-italic',
  'script',
  'bold-script',
  'fraktur',
  'double-struck',
  'bold-fraktur',
  'sans-serif',
  'bold-sans-serif',
  'sans-serif-italic',
  'sans-serif-bold-italic',
  'monospace',
] as const;
const MATH_ALPHANUMERIC_DIGITS = [
  'bold',
  'double-struck',
  'sans-serif',
  'bold-sans-serif',
  'monospace',
] as const;

const SYMBOL_SIGNATURES = new Map<string, string[]>();
for (const [signature, texts] of Object.entries(MATHML_TEX_SYMBOLS)) {
  for (const text of texts) {
    SYMBOL_SIGNATURES.set(text, [
      ...(SYMBOL_SIGNATURES.get(text) ?? []),
      signature,
    ]);
  }
}

const byArgumentFreeFirstThenDisplayOnlyLast = (
  [, a]: readonly [string, MathmlTexEnvironment],
  [, b]: readonly [string, MathmlTexEnvironment]
) =>
  Number(a.argument !== '') - Number(b.argument !== '') ||
  Number(a.display) - Number(b.display);

const ENVIRONMENTS = Object.entries(MATHML_TEX_ENVIRONMENTS).toSorted(
  byArgumentFreeFirstThenDisplayOnlyLast
);
const LONGEST_ENVIRONMENT_CHAIN = Math.max(
  ...ENVIRONMENTS.map(([, { table }]) => table.split('>').length - 1)
);

const attributesOf = (element: Element) =>
  new Map(
    Array.from(element.attributes)
      .filter((attribute) => !INERT_ATTRIBUTE.test(attribute.name))
      .map((attribute) => [attribute.name, attribute.value])
  );

const signatureOf = (tag: string, attributes: ReadonlyMap<string, string>) =>
  [
    tag,
    ...[...attributes]
      .toSorted(([a], [b]) => (a < b ? -1 : 1))
      .map(([name, value]) => `${name}="${value}"`),
  ].join(' ');

const signature = (element: Element) =>
  signatureOf(element.localName, attributesOf(element));

const without = (
  attributes: ReadonlyMap<string, string>,
  ...names: readonly string[]
) => new Map([...attributes].filter(([name]) => !names.includes(name)));

const readOrRefuse = (element: Element, names: readonly string[]) => {
  const attributes = attributesOf(element);
  for (const name of attributes.keys()) {
    if (name !== 'class' && !names.includes(name)) refuse(element);
  }
  return attributes;
};

const childrenOf = (element: Element) => {
  for (const node of element.childNodes) {
    if (node.nodeType === 3 && !/^[\t\n\r ]*$/u.test(node.textContent ?? '')) {
      refuse(element);
    }
  }
  return Array.from(element.children);
};

const exactly = (element: Element, count: number) => {
  const children = childrenOf(element);
  if (children.length !== count) refuse(element);
  return children;
};

const isLeaf = (element: Element) => element.children.length === 0;

/** A token's text as MathML draws it, with XML white space trimmed and collapsed. */
const textOf = (element: Element) =>
  (element.textContent ?? '')
    .replaceAll(/^[\t\n\r ]+|[\t\n\r ]+$/gu, '')
    .replaceAll(/[\t\n\r ]+/gu, ' ');

const isFunctionApplication = (element: Element | undefined) =>
  element?.localName === 'mo' &&
  isLeaf(element) &&
  textOf(element) === '\u2061';

const pick = (entry: MathmlTexPick, context: Context) => {
  if (typeof entry === 'string') return entry;
  const [name, ...others] = entry;
  context.picks.set(name, { name, others });
  return name;
};

const codePoint = (ch: string) =>
  (ch.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0');

const join = (parts: readonly string[]) =>
  parts.reduce(
    (tex, part) =>
      tex +
      (/\\[A-Za-z]+$/u.test(tex) && /^[A-Za-z]/u.test(part) ? ' ' : '') +
      part,
    ''
  );

const group = (tex: string): Tex => ({
  tex: `{${tex}}`,
  unbraced: tex,
  unit: true,
});

const unit = (tex: string): Tex => ({ tex, unit: true });

const argument = (tex: Tex) => (tex.bare ? tex.tex : `{${tex.tex}}`);

/** An optional argument, braced unless it is plain, because KaTeX ends one at the first `]` outside braces. */
const optional = (tex: string) =>
  /^(?:\\?[A-Za-z]+|\d+)$/u.test(tex) ? `[${tex}]` : `[{${tex}}]`;

const scriptArgument = (tex: Tex) => {
  if (tex.bare || tex.unbraced !== undefined) return tex.tex;
  if (SINGLE_TOKEN.test(tex.tex) && !tex.tex.startsWith('\\')) return tex.tex;
  return `{${tex.tex}}`;
};

const base = (tex: Tex) => {
  if (tex.tex === '') return '{}';
  return tex.unit ? tex.tex : `{${tex.tex}}`;
};

// KaTeX keeps the em scale in scripts, fractions and root indexes, and changes
// it only at a style or size switch.
const scriptContext = (context: Context): Context => ({
  ...context,
  displayStyle: false,
});

/** KaTeX's `makeEm` rounds each width it writes to 4 decimals. */
const KATEX_EM_DIGITS = 4;
const MOST_LENGTH_DIGITS = 8;

const roundTripEm = (width: number, context: Context) => {
  const { emScale } = context;
  const written = Number(width.toFixed(KATEX_EM_DIGITS));
  if (emScale === undefined) {
    context.lost.add('spacing');
    return `${written}em`;
  }
  for (let digits = 0; digits <= MOST_LENGTH_DIGITS; digits++) {
    const length = Number((width / emScale).toFixed(digits));
    if (Number((length * emScale).toFixed(KATEX_EM_DIGITS)) === written) {
      return `${length}em`;
    }
  }
  context.lost.add('spacing');
  return `${Number((width / emScale).toFixed(MOST_LENGTH_DIGITS))}em`;
};

const styleEmScale = (name: MathmlTexName | undefined, context: Context) =>
  name === undefined || context.emScale === undefined
    ? context.emScale
    : MATHML_TEX_STYLE_EM_SCALES[name];

const styledContext = (style: Element, context: Context): Context => {
  const switched = MATHML_TEX_SIZES[signature(style)];
  const displaystyle = style.getAttribute('displaystyle');
  return {
    ...context,
    displayStyle:
      displaystyle === null ? context.displayStyle : displaystyle === 'true',
    emScale: styleEmScale(
      typeof switched === 'string' ? switched : switched?.[0],
      context
    ),
  };
};

/** JavaScript writes a number from this size up with an exponent, which TeX cannot read. */
const EXPONENT_FORM = 1e21;

const emWidth = (value: string | undefined) => {
  if (value === undefined || !/^-?(?:\d+\.?\d*|\.\d+)em$/u.test(value)) {
    return undefined;
  }
  const width = Number.parseFloat(value);
  return Math.abs(width) < EXPONENT_FORM ? width : undefined;
};

const mathAlphanumeric = (ch: string, tag: string, context: Context) => {
  const code = ch.codePointAt(0) ?? 0;
  let variant: string | undefined;
  let letter: string | undefined;
  if (code >= 0x1_d4_00 && code < 0x1_d4_00 + 52 * 13) {
    const offset = code - 0x1_d4_00;
    variant = MATH_ALPHANUMERIC_LETTERS[Math.floor(offset / 52)];
    const index = offset % 52;
    letter = String.fromCodePoint(
      index < 26 ? 0x41 + index : 0x61 + index - 26
    );
  } else if (code >= 0x1_d7_ce && code <= 0x1_d7_ff) {
    const offset = code - 0x1_d7_ce;
    variant = MATH_ALPHANUMERIC_DIGITS[Math.floor(offset / 10)];
    letter = String(offset % 10);
  }
  if (variant === undefined || letter === undefined) return undefined;
  if (variant === 'italic' && /[A-Za-z]/u.test(letter)) return letter;
  const font =
    MATHML_TEX_FONTS[
      `${/\d/u.test(letter) ? 'mn' : tag === 'mn' ? 'mi' : tag} mathvariant="${variant}"`
    ];
  return font === undefined ? undefined : `${pick(font, context)}{${letter}}`;
};

const character = (
  element: Element,
  tag: string,
  ch: string,
  context: Context
): string => {
  const named = MATHML_TEX_TOKENS.math[tag]?.[ch];
  if (named !== undefined) return pick(named, context);
  if (/^[!-~]$/u.test(ch)) {
    return MATHML_TEX_ASCII_ITSELF.includes(ch) ? ch : refuse(element);
  }
  const signatures = SYMBOL_SIGNATURES.get(ch);
  if (signatures !== undefined) {
    const chosen =
      signatures.find((key) => key.split(' ')[0] === tag) ?? signatures[0];
    return pick(MATHML_TEX_TOKENS.math[chosen][ch], context);
  }
  const alphanumeric = mathAlphanumeric(ch, tag, context);
  if (alphanumeric !== undefined) return alphanumeric;
  if (!PRINTABLE.test(ch)) refuse(element);
  context.lost.add(`symbol U+${codePoint(ch)}`);
  return ch;
};

/**
 * MathML Core draws an `mn` with no space around its signs, where TeX sets
 * `1,5` with a space after the comma and `1-2` with one around the minus.
 */
const numeral = (element: Element, ch: string, context: Context) => {
  if (/^[*+,:;<=>-]$/u.test(ch)) return `{${ch}}`;
  if (/\s/u.test(ch) || (/\p{L}/u.test(ch) && !/^[A-Za-z]$/u.test(ch))) {
    refuse(element);
  }
  const tex = character(element, 'mn', ch, context);
  return /^[\p{N}\u0020-\u007E]$/u.test(ch) ? tex : `{${tex}}`;
};

const letterByLetter = (
  element: Element,
  attributes: ReadonlyMap<string, string>,
  context: Context,
  text: string
): Tex => {
  const letters = Array.from(text, (ch) =>
    leaf(element, 'mi', attributes, context, ch)
  );
  return letters.length === 1
    ? letters[0]
    : { tex: join(letters.map((letter) => letter.tex)), unit: false };
};

/**
 * MathML Core draws an `mn`, `mo` or `mtext` upright, so its
 * `mathvariant="normal"` changes nothing, and draws an `mi` of more than one
 * character upright, as `mathvariant="normal"` does.
 */
const tokenAttributes = (element: Element) => {
  const attributes = attributesOf(element);
  if (!isLeaf(element)) return attributes;
  if (
    element.localName !== 'mi' &&
    attributes.get('mathvariant') === 'normal'
  ) {
    attributes.delete('mathvariant');
  }
  if (element.localName !== 'mi' || attributes.has('mathvariant')) {
    return attributes;
  }
  const text = textOf(element);
  if (
    Array.from(text).length > 1 &&
    MATHML_TEX_TOKENS.math[signatureOf('mi', attributes)]?.[text] ===
      undefined &&
    MATHML_TEX_TOKENS.math.mi?.[text] === undefined
  ) {
    attributes.set('mathvariant', 'normal');
  }
  return attributes;
};

const textCharacter = (element: Element, ch: string, context: Context) => {
  const named =
    MATHML_TEX_TOKENS.text.mtext[ch] ?? MATHML_TEX_SPACES.text.mtext[ch];
  if (named !== undefined) return pick(named, context);
  if (ch === ' ' || ch === '\u00A0') return '\\ ';
  if (/^[./@]$/u.test(ch)) return ch;
  if (!PRINTABLE.test(ch)) refuse(element);
  context.lost.add(`symbol U+${codePoint(ch)}`);
  return ch;
};

const longest = (
  text: string,
  at: number,
  entries: Readonly<Record<string, MathmlTexPick>> | undefined
) => {
  if (entries === undefined) return undefined;
  for (let length = Math.min(5, text.length - at); length > 0; length--) {
    const key = text.slice(at, at + length);
    if (entries[key] !== undefined) return { entry: entries[key], key };
  }
  return undefined;
};

const textRun = (element: Element, text: string, context: Context) => {
  const parts: string[] = [];
  for (let at = 0; at < text.length;) {
    const match =
      longest(text, at, MATHML_TEX_TOKENS.text.mtext) ??
      longest(text, at, MATHML_TEX_SPACES.text.mtext);
    if (match !== undefined) {
      parts.push(pick(match.entry, context));
      at += match.key.length;
      continue;
    }
    const ch = String.fromCodePoint(text.codePointAt(at) ?? 0);
    parts.push(textCharacter(element, ch, context));
    at += ch.length;
  }
  return join(parts);
};

const color = (value: string, body: Tex, context: Context): Tex => {
  if (KATEX_COLOR.test(value)) {
    return unit(`\\textcolor{${value}}{${body.tex}}`);
  }
  context.lost.add('color');
  return body;
};

const ATTRIBUTE_LOSSES: Readonly<Record<string, MathmlTexLoss | null>> =
  withoutPrototype({
    accent: null,
    fence: null,
    form: 'spacing',
    largeop: 'size',
    lspace: 'spacing',
    mathbackground: 'color',
    mathsize: 'size',
    maxsize: 'size',
    minsize: 'size',
    movablelimits: null,
    rspace: 'spacing',
    separator: null,
    stretchy: 'stretch',
    symmetric: 'stretch',
  });

const leaf = (
  element: Element,
  tag: string,
  attributes: ReadonlyMap<string, string>,
  context: Context,
  text = textOf(element)
): Tex => {
  const key = signatureOf(tag, attributes);
  const named = MATHML_TEX_TOKENS.math[key]?.[text];
  if (named !== undefined) {
    if (typeof named !== 'string' && POSITION_PAIRS.has(named[0])) {
      return {
        positionalPair: [named[0], named[1]],
        tex: named[0],
        unit: true,
      };
    }
    const tex = pick(named, context);
    return { bare: tag === 'mo' && SINGLE_TOKEN.test(tex), tex, unit: true };
  }
  const mathcolor = attributes.get('mathcolor');
  if (mathcolor !== undefined) {
    return color(
      mathcolor,
      leaf(element, tag, without(attributes, 'mathcolor'), context, text),
      context
    );
  }
  if (tag === 'mo') {
    if (
      attributes.get('lspace') === '0em' &&
      attributes.get('rspace') === '0em'
    ) {
      const inner = leaf(
        element,
        tag,
        without(attributes, 'lspace', 'rspace'),
        context,
        text
      );
      return group(inner.tex);
    }
    const sized = MATHML_TEX_DELIMITER_SIZES[key];
    const delimiter = MATHML_TEX_DELIMITERS[text];
    if (sized !== undefined && attributes.has('minsize') && delimiter) {
      return unit(
        join([sizedName(sized, text, context), pick(delimiter, context)])
      );
    }
    const wrapper = MATHML_TEX_CLASSES[key];
    if (wrapper !== undefined && attributes.size > 0) {
      const inner = leaf(element, tag, new Map(), context, text);
      return unit(`${pick(wrapper, context)}{${inner.tex}}`);
    }
  }
  // KaTeX writes `\not` as U+0338 after the character it crosses out. `\not`
  // is an atom of its own, so a script takes the pair only in braces.
  if (tag === 'mo' && text.length > 1 && text.endsWith('\u0338')) {
    const crossed = leaf(element, tag, attributes, context, text.slice(0, -1));
    return { tex: join(['\\not', crossed.tex]), unit: false };
  }
  const variant = attributes.get('mathvariant');
  // `\mathrm` sets a symbol as an operator, and only `\char` sets it upright
  // as an identifier.
  if (
    tag === 'mi' &&
    variant === 'normal' &&
    attributes.size === 1 &&
    /^[^\p{L}\p{N}]$/u.test(text)
  ) {
    return group(`\\char"${codePoint(text)}`);
  }
  if (variant !== undefined && tag !== 'mo') {
    const font =
      MATHML_TEX_FONTS[signatureOf(tag, new Map([['mathvariant', variant]]))];
    if (font === undefined && (tag !== 'mi' || variant !== 'italic')) {
      refuse(element);
    }
    const plain = without(attributes, 'mathvariant');
    const inner =
      tag === 'mi'
        ? letterByLetter(element, plain, context, text)
        : leaf(element, tag, plain, context, text);
    return font === undefined
      ? inner
      : unit(`${pick(font, context)}{${inner.tex}}`);
  }
  for (const name of attributes.keys()) {
    if (!(name in ATTRIBUTE_LOSSES) && name !== 'class') refuse(element);
    const loss = ATTRIBUTE_LOSSES[name];
    if (loss) context.lost.add(loss);
  }
  if (attributes.size > 0) {
    const plain = MATHML_TEX_TOKENS.math[tag]?.[text];
    if (plain !== undefined) {
      const tex = pick(plain, context);
      return { bare: tag === 'mo' && SINGLE_TOKEN.test(tex), tex, unit: true };
    }
  }
  const operator =
    tag === 'mo' ? nameOperator(element, text, context) : undefined;
  if (operator !== undefined) return unit(operator.tex);
  if (text === '') refuse(element);
  const characters = Array.from(text, (ch) =>
    tag === 'mn'
      ? numeral(element, ch, context)
      : character(element, tag, ch, context)
  );
  const tex = join(characters);
  return {
    bare: tag === 'mo' && characters.length === 1 && SINGLE_TOKEN.test(tex),
    tex,
    unit: characters.length === 1 && SINGLE_TOKEN.test(tex),
  };
};

const sizedName = (sized: MathmlTexPick, text: string, context: Context) => {
  if (typeof sized !== 'string' && sized.length === 2) {
    if (OPENING_TEXT.has(text)) return sized[0];
    if (CLOSING_TEXT.has(text)) return sized[1];
  }
  return pick(sized, context);
};

const CHAIN_DEPTHS = new WeakMap<MathmlTexBySignature, number>();

const wrapped = (
  element: Element,
  table: MathmlTexBySignature,
  context: Context
): Tex | undefined => {
  let longestChain = CHAIN_DEPTHS.get(table);
  if (longestChain === undefined) {
    longestChain = Math.max(
      ...Object.keys(table).map((key) => key.split('>').length)
    );
    CHAIN_DEPTHS.set(table, longestChain);
  }
  const links = [element];
  for (
    let last = element;
    links.length < longestChain && last.children.length === 1;
  ) {
    last = last.children[0];
    links.push(last);
  }
  for (let depth = links.length; depth > 0; depth--) {
    const key = links.slice(0, depth).map(signature).join('>');
    const name = table[key];
    if (name === undefined) continue;
    const innermost = links[depth - 1];
    const inner = links
      .slice(0, depth)
      .reduce(
        (at, link) =>
          link.localName === 'mstyle' ? styledContext(link, at) : at,
        context
      );
    const body =
      isLeaf(innermost) && innermost.localName === 'mtext'
        ? textRun(innermost, textOf(innermost), inner)
        : row(childrenOf(innermost), inner).tex;
    return unit(`${pick(name, context)}{${body}}`);
  }
  return undefined;
};

const mtext = (element: Element, context: Context): Tex => {
  readOrRefuse(element, ['mathcolor', 'mathvariant']);
  const attributes = tokenAttributes(element);
  const mathcolor = attributes.get('mathcolor');
  if (mathcolor !== undefined) {
    return color(
      mathcolor,
      mtextBody(element, without(attributes, 'mathcolor'), context),
      context
    );
  }
  return mtextBody(element, attributes, context);
};

const mtextBody = (
  element: Element,
  attributes: ReadonlyMap<string, string>,
  context: Context
): Tex => {
  const text = textOf(element);
  const key = signatureOf('mtext', attributes);
  const named =
    MATHML_TEX_TOKENS.math[key]?.[text] ?? MATHML_TEX_SPACES.math[key]?.[text];
  if (named !== undefined) return unit(pick(named, context));
  const font = MATHML_TEX_FONTS[key];
  if (font === undefined) refuse(element);
  if (attributes.size > 0) {
    return unit(`${pick(font, context)}{${textRun(element, text, context)}}`);
  }
  const spaces = (from: number, to: number) => {
    const parts: string[] = [];
    for (let at = from; at < to;) {
      const match = longest(
        text.slice(0, to),
        at,
        MATHML_TEX_SPACES.math.mtext
      );
      if (match === undefined) {
        context.lost.add('spacing');
        parts.push('\\ ');
        at += 1;
        continue;
      }
      parts.push(pick(match.entry, context));
      at += match.key.length;
    }
    return parts;
  };
  const isSpace = (ch: string) =>
    /^[\s\u00A0\u2000-\u200A\u2063\u205F]$/u.test(ch);
  let start = 0;
  while (start < text.length && isSpace(text[start])) start += 1;
  let end = text.length;
  while (end > start && isSpace(text[end - 1])) end -= 1;
  const parts = [
    ...spaces(0, start),
    ...(end > start
      ? [
          `${pick(font, context)}{${textRun(element, text.slice(start, end), context)}}`,
        ]
      : []),
    ...spaces(end, text.length),
  ];
  if (parts.length === 0) refuse(element);
  const tex = join(parts);
  return { tex, unit: parts.length === 1 };
};

const mspace = (element: Element, context: Context): Tex => {
  const attributes = readOrRefuse(element, [
    'depth',
    'height',
    'linebreak',
    'mathbackground',
    'width',
  ]);
  const named =
    context.emScale === 1
      ? MATHML_TEX_SPACES.math[signatureOf('mspace', attributes)]?.['']
      : undefined;
  const width = emWidth(attributes.get('width'));
  let space = '';
  if (named !== undefined) space = pick(named, context);
  else if (width !== undefined && attributes.size === 1) {
    space = `\\hspace{${roundTripEm(width, context)}}`;
  } else context.lost.add('spacing');
  if (childrenOf(element).length > 0) refuse(element);
  return unit(space);
};

/** An `mo` of letters, such as MathJax's `max`, which MathML Core draws upright. */
const OPERATOR_LETTERS = /^\p{L}{2,}$/u;

/**
 * KaTeX's operator names by their letters, because producers space a name such
 * as `lim sup` differently: KaTeX with U+2009 and MathJax with U+2006.
 */
const OPERATOR_NAMES: Readonly<Record<string, string>> = withoutPrototype(
  Object.fromEntries(
    [
      MATHML_TEX_TOKENS.math.mi,
      MATHML_TEX_TOKENS.math['mi mathvariant="normal"'],
    ]
      .flatMap((byText) => Object.entries(byText ?? {}))
      .flatMap(([text, named]) =>
        typeof named === 'string' && named in MATHML_TEX_OPERATORS
          ? [[text.replace(/\s/gu, ''), named]]
          : []
      )
  )
);

const nameOperator = (
  element: Element,
  text: string,
  context: Context
): Operator | undefined => {
  const named = OPERATOR_NAMES[text.replace(/\s/gu, '')];
  if (named !== undefined) {
    return {
      displayLimits: MATHML_TEX_OPERATORS[named],
      limitsTex: named,
      tex: named,
    };
  }
  if (!OPERATOR_LETTERS.test(text)) return undefined;
  const body = join(
    Array.from(text, (ch) => character(element, 'mi', ch, context))
  );
  return {
    displayLimits: false,
    limitsTex: `\\operatorname*{${body}}`,
    tex: `\\operatorname{${body}}`,
  };
};

const operatorName = (
  identifier: Element,
  context: Context
): Tex | undefined => {
  const attributes = tokenAttributes(identifier);
  const leafText = isLeaf(identifier) ? textOf(identifier) : undefined;
  const named =
    leafText !== undefined &&
    MATHML_TEX_TOKENS.math[signature(identifier)]?.[leafText];
  if (typeof named === 'string' && named in MATHML_TEX_OPERATORS) {
    const displayLimits = MATHML_TEX_OPERATORS[named];
    return {
      operator: { displayLimits, limitsTex: named, tex: named },
      tex: named,
      unit: true,
    };
  }
  if (attributes.size === 1 && attributes.get('mathvariant') === 'normal') {
    // KaTeX joins the letters of a name into one `mi`, with a thin space
    // where the name had `\,`.
    const body =
      leafText === undefined
        ? row(childrenOf(identifier), context).tex
        : join(
            Array.from(leafText, (ch) =>
              ch === '\u2009' ? '\\,' : character(identifier, 'mi', ch, context)
            )
          );
    const tex = `\\operatorname{${body}}`;
    return {
      operator: {
        displayLimits: false,
        limitsTex: `\\operatorname*{${body}}`,
        tex,
      },
      tex,
      unit: true,
    };
  }
  return undefined;
};

const operatorOf = (
  element: Element,
  context: Context
): Operator | undefined => {
  const tag = element.localName;
  if ((tag === 'mo' || tag === 'mi') && isLeaf(element)) {
    const text = textOf(element);
    const attributes = without(tokenAttributes(element), 'movablelimits');
    const named = MATHML_TEX_TOKENS.math[signatureOf(tag, attributes)]?.[text];
    if (typeof named === 'string' && named in MATHML_TEX_OPERATORS) {
      return {
        displayLimits: MATHML_TEX_OPERATORS[named],
        limitsTex: named,
        tex: named,
      };
    }
    if (tag === 'mo' && attributes.size === 0) {
      return nameOperator(element, text, context);
    }
    return undefined;
  }
  if (tag === 'mrow' && element.children.length === 2) {
    const [identifier, application] = Array.from(element.children);
    if (identifier.localName === 'mi' && isFunctionApplication(application)) {
      return operatorName(identifier, context)?.operator;
    }
  }
  if (tag === 'mo' && attributesOf(element).size === 0) {
    const tex = `\\mathop{${row(childrenOf(element), context).tex}}`;
    return { displayLimits: false, limitsTex: tex, tex };
  }
  return undefined;
};

const settlePairs = (pieces: Tex[], context: Context) => {
  const counts = new Map<MathmlTexName, number>();
  for (const piece of pieces) {
    if (piece.positionalPair) {
      counts.set(
        piece.positionalPair[0],
        (counts.get(piece.positionalPair[0]) ?? 0) + 1
      );
    }
  }
  const seen = new Map<MathmlTexName, number>();
  return pieces.map((piece) => {
    if (!piece.positionalPair) return piece;
    const [open, close] = piece.positionalPair;
    const index = seen.get(open) ?? 0;
    seen.set(open, index + 1);
    if (index % 2 === 1) return { tex: close, unit: true };
    if (index === (counts.get(open) ?? 0) - 1) {
      context.picks.set(open, { name: open, others: [close] });
    }
    return { tex: open, unit: true };
  });
};

const isBareFence = (element: Element) =>
  element.localName === 'mo' &&
  isLeaf(element) &&
  !element.hasAttribute('stretchy') &&
  FENCE_TEXT.has(textOf(element));

const isTall = (element: Element): boolean => {
  if (TALL_TAGS.has(element.localName)) return true;
  const [first] = Array.from(element.children);
  if (/^m(?:sub|sup|subsup|under|over|underover)$/u.test(element.localName)) {
    return first !== undefined && isTall(first);
  }
  return (
    element.localName === 'mo' &&
    isLeaf(element) &&
    LARGE_OPERATOR_TEXT.has(textOf(element))
  );
};

const row = (elements: readonly Element[], context: Context): Tex => {
  const pieces: Tex[] = [];
  for (let index = 0; index < elements.length; index++) {
    const element = elements[index];
    if (
      element.localName === 'mo' &&
      isLeaf(element) &&
      INVISIBLE_OPERATOR.test(textOf(element))
    ) {
      continue;
    }
    if (
      element.localName === 'mi' &&
      isFunctionApplication(elements[index + 1])
    ) {
      pieces.push(operatorName(element, context) ?? convert(element, context));
      index += 1;
      continue;
    }
    pieces.push(convert(element, context));
  }
  if (elements.some(isBareFence) && elements.some(isTall)) {
    context.lost.add('stretch');
  }
  const settled = settlePairs(pieces, context).filter(
    (piece) => piece.tex !== ''
  );
  if (settled.length === 1) return settled[0];
  return {
    tex: join(settled.map((piece) => piece.tex)),
    unit: settled.length === 0,
  };
};

const FENCE = 'mo fence="true"';
const MIDDLE = 'mo fence="true" lspace="0.05em" rspace="0.05em"';

const CLOSING_BARS: Readonly<Record<string, string>> = withoutPrototype({
  '\\lVert': '\\rVert',
  '\\lvert': '\\rvert',
});

const delimiter = (text: string, context: Context, closing = false) => {
  if (text === '') return '.';
  const named = MATHML_TEX_DELIMITERS[text];
  if (named === undefined) {
    context.lost.add('stretch');
    return '.';
  }
  const name = pick(named, context);
  return (closing && CLOSING_BARS[name]) || name;
};

const fenced = (
  children: readonly Element[],
  context: Context
): Tex | undefined => {
  const isFence = (element: Element | undefined) =>
    element !== undefined && isLeaf(element) && signature(element) === FENCE;
  const open = isFence(children[0]) ? children[0] : undefined;
  const last = children.at(-1);
  const close =
    children.length > (open ? 1 : 0) && isFence(last) ? last : undefined;
  if (!open && !close) return undefined;
  const inner = children.slice(open ? 1 : 0, close ? -1 : undefined);
  const [opening, closing] = [open, close].map((fence) =>
    fence === undefined ? '' : textOf(fence)
  );
  if (inner.length === 1) {
    const environment = environmentOf(inner[0], opening, closing, context);
    if (environment !== undefined) return environment;
  }
  const parts = ['\\left', delimiter(opening, context)];
  let run: Element[] = [];
  const flush = () => {
    parts.push(row(run, context).tex);
    run = [];
  };
  for (const element of inner) {
    if (isLeaf(element) && signature(element) === MIDDLE) {
      flush();
      parts.push('\\middle', delimiter(textOf(element), context));
    } else {
      run.push(element);
    }
  }
  flush();
  parts.push('\\right', delimiter(closing, context, true));
  return unit(join(parts));
};

const SIGNATURE_ATTRIBUTE = /(\S+)="([^"]*)"/gu;

const fitsTable = (
  table: Element,
  expected: string,
  kind: MathmlTexEnvironment['argument'],
  columns: number
) => {
  const want = new Map(
    Array.from(expected.matchAll(SIGNATURE_ATTRIBUTE), ([, name, value]) => [
      name,
      value,
    ])
  );
  const have = attributesOf(table);
  if (kind === 'columns') {
    want.delete('columnalign');
    have.delete('columnalign');
  }
  if (want.size !== have.size) return false;
  return [...have].every(([name, value]) => {
    const period = want.get(name)?.split(' ');
    if (period === undefined) return false;
    if (!name.startsWith('column')) return value === want.get(name);
    if (value === '') return columns < 2;
    const items = value.split(' ');
    // KaTeX writes one value per column or per gap, or just the repeating
    // unit, as `alignat` writes its spacing.
    return (
      (items.length >= columns - 1 || items.length === period.length) &&
      items.every((item, index) => item === period[index % period.length])
    );
  });
};

type Cell = { readonly parts: readonly Element[]; readonly style?: Element };

const environmentCells = (
  table: Element,
  environment: MathmlTexEnvironment
) => {
  const [before, after] = environment.glue;
  const depth = environment.cell.split('>').length;
  const rows: Cell[][] = [];
  let columns: number | undefined;
  for (const tableRow of childrenOf(table)) {
    if (tableRow.localName !== 'mtr') return undefined;
    let cells = childrenOf(tableRow);
    const glue = (cell: Element | undefined, key: string) =>
      cell !== undefined &&
      cell.localName === 'mtd' &&
      signature(cell) === key &&
      cell.children.length === 0;
    if (!before.every((key, index) => glue(cells[index], key))) {
      return undefined;
    }
    cells = cells.slice(before.length);
    if (after.length > 0) {
      const tail = cells.slice(-after.length);
      if (!after.every((key, index) => glue(tail[index], key))) {
        return undefined;
      }
      cells = cells.slice(0, -after.length);
    }
    if (columns !== undefined && cells.length !== columns) refuse(table);
    columns = cells.length;
    const texts: Cell[] = [];
    for (const [index, cell] of cells.entries()) {
      const chain = [cell];
      let inside = cell;
      while (chain.length < depth && inside.children.length === 1) {
        inside = inside.children[0];
        chain.push(inside);
      }
      if (chain.map(signature).join('>') !== environment.cell) return undefined;
      let parts = childrenOf(inside);
      const [only] = parts;
      if (
        environment.leads &&
        index % 2 === 1 &&
        parts.length === 1 &&
        only.localName === 'mrow'
      ) {
        const [lead] = Array.from(only.children);
        if (only.childNodes.length === 0) parts = [];
        else if (lead?.localName === 'mrow' && lead.childNodes.length === 0) {
          parts = Array.from(only.children).slice(1);
        }
      }
      texts.push({
        parts,
        style: chain.findLast((link) => link.localName === 'mstyle'),
      });
    }
    rows.push(texts);
  }
  return { columns: columns ?? 0, rows };
};

const cellTex = ({ parts, style }: Cell, context: Context) => {
  const cell = { ...context, displayStyle: false };
  const inner = style === undefined ? cell : styledContext(style, cell);
  const content = row(parts, inner);
  return content.unbraced ?? content.tex;
};

const COLUMN_LETTERS: Readonly<Record<string, string>> = withoutPrototype({
  center: 'c',
  left: 'l',
  right: 'r',
});

const environmentArgument = (
  environment: MathmlTexEnvironment,
  table: Element,
  columns: number
) => {
  if (environment.argument === 'pairs') return `{${Math.ceil(columns / 2)}}`;
  if (environment.argument === '') return '';
  const aligns = (table.getAttribute('columnalign') ?? 'center').split(' ');
  return `{${Array.from({ length: columns }, (_, index) => COLUMN_LETTERS[aligns[Math.min(index, aligns.length - 1)]] ?? 'c').join('')}}`;
};

const environmentOf = (
  element: Element,
  open: string,
  close: string,
  context: Context
): Tex | undefined => {
  const links: Element[] = [];
  let table = element;
  while (table.localName !== 'mtable') {
    if (
      links.length === LONGEST_ENVIRONMENT_CHAIN ||
      table.children.length !== 1
    ) {
      return undefined;
    }
    links.push(table);
    table = table.children[0];
  }
  const outer = links.map(signature).join('>');
  const width = table.firstElementChild?.children.length ?? 0;
  for (const [name, environment] of ENVIRONMENTS) {
    const chain = environment.table.split('>');
    const own = chain.pop() ?? '';
    const columns =
      width - environment.glue[0].length - environment.glue[1].length;
    if (
      chain.join('>') !== outer ||
      !fitsTable(table, own, environment.argument, columns) ||
      environment.open !== open ||
      environment.close !== close ||
      (environment.display && !context.block)
    ) {
      continue;
    }
    const body = environmentCells(table, environment);
    if (body === undefined) continue;
    const tex = body.rows
      .map((cells) => cells.map((cell) => cellTex(cell, context)).join(' & '))
      .join(' \\\\ ');
    return unit(
      `\\begin{${name}}${environmentArgument(environment, table, body.columns)}${tex}\\end{${name}}`
    );
  }
  return undefined;
};

const tagged = (table: Element, context: Context): Tex | undefined => {
  if (signature(table) !== 'mtable width="100%"') return undefined;
  const rows = childrenOf(table);
  if (rows.length !== 1) return undefined;
  const cells = childrenOf(rows[0]);
  const [left, body, right, label] = cells;
  const spacer = (cell: Element | undefined) =>
    cell !== undefined &&
    signature(cell) === 'mtd width="50%"' &&
    cell.children.length === 0;
  if (cells.length !== 4 || !spacer(left) || !spacer(right)) return undefined;
  const [text] = childrenOf(label);
  if (
    childrenOf(label).length !== 1 ||
    text.localName !== 'mtext' ||
    !isLeaf(text)
  ) {
    return undefined;
  }
  // KaTeX numbers only display math.
  if (!context.block) {
    context.lost.add('label');
    return row(childrenOf(body), context);
  }
  const name = textOf(text);
  const tag = /^\(.*\)$/u.test(name)
    ? `\\tag{${textRun(text, name.slice(1, -1), context)}}`
    : `\\tag*{${textRun(text, name, context)}}`;
  return unit(join([tag, row(childrenOf(body), context).tex]));
};

const matrix = (table: Element, context: Context): Tex => {
  const attributes = readOrRefuse(table, [
    'columnalign',
    'columnlines',
    'columnspacing',
    'frame',
    'rowalign',
    'rowlines',
    'rowspacing',
    'width',
  ]);
  if (attributes.size > 0) context.lost.add('spacing');
  const cellsContext = { ...context, displayStyle: false };
  const rows: string[] = [];
  let columns: number | undefined;
  for (const tableRow of childrenOf(table)) {
    if (tableRow.localName !== 'mtr' && tableRow.localName !== 'mlabeledtr') {
      refuse(tableRow);
    }
    readOrRefuse(tableRow, ['columnalign', 'rowalign']);
    let cells = childrenOf(tableRow);
    if (tableRow.localName === 'mlabeledtr') {
      context.lost.add('label');
      cells = cells.slice(1);
    }
    if (columns !== undefined && cells.length !== columns) refuse(table);
    columns = cells.length;
    rows.push(
      cells
        .map((cell) => {
          if (cell.localName !== 'mtd') refuse(cell);
          if (
            readOrRefuse(cell, [
              'columnalign',
              'columnspan',
              'rowalign',
              'rowspan',
            ]).size > 0
          ) {
            context.lost.add('spacing');
          }
          return row(childrenOf(cell), cellsContext).tex;
        })
        .join(' & ')
    );
  }
  return unit(`\\begin{matrix}${rows.join(' \\\\ ')}\\end{matrix}`);
};

const style = (element: Element, context: Context): Tex => {
  const environment = environmentOf(element, '', '', context);
  if (environment !== undefined) return environment;
  const attributes = readOrRefuse(element, [
    'displaystyle',
    'mathbackground',
    'mathcolor',
    'mathsize',
    'scriptlevel',
  ]);
  let inner = context;
  const switches: string[] = [];
  const switchTo = (key: string) => {
    const name = MATHML_TEX_SIZES[key];
    if (name === undefined) {
      context.lost.add('size');
      return;
    }
    const written = pick(name, context);
    switches.push(written);
    inner = { ...inner, emScale: styleEmScale(written, inner) };
  };
  const displaystyle = attributes.get('displaystyle');
  if (attributes.has('scriptlevel') || displaystyle !== undefined) {
    inner = {
      ...inner,
      displayStyle:
        displaystyle === undefined
          ? inner.displayStyle
          : displaystyle === 'true',
    };
    switchTo(
      signatureOf(
        'mstyle',
        new Map(
          [...attributes].filter(
            ([name]) => name === 'displaystyle' || name === 'scriptlevel'
          )
        )
      )
    );
  }
  const mathsize = attributes.get('mathsize');
  if (mathsize !== undefined) {
    switchTo(signatureOf('mstyle', new Map([['mathsize', mathsize]])));
  }
  if (attributes.has('mathbackground')) context.lost.add('color');
  let body = row(childrenOf(element), inner);
  if (switches.length > 0) body = group(join([...switches, body.tex]));
  const mathcolor = attributes.get('mathcolor');
  return mathcolor === undefined ? body : color(mathcolor, body, context);
};

const padded = (element: Element, context: Context): Tex => {
  const named = wrapped(element, MATHML_TEX_PADDING, context);
  if (named !== undefined) return named;
  const [space] = Array.from(element.children);
  if (
    element.children.length === 1 &&
    signature(element) === 'mpadded height="0em" voffset="0em"' &&
    space.localName === 'mspace' &&
    isLeaf(space)
  ) {
    const attributes = attributesOf(space);
    const width = emWidth(attributes.get('width'));
    const height = emWidth(attributes.get('height'));
    if (
      attributes.size === 3 &&
      attributes.get('mathbackground') === 'black' &&
      width !== undefined &&
      height !== undefined
    ) {
      return unit(
        `\\rule{${roundTripEm(width, context)}}{${roundTripEm(height, context)}}`
      );
    }
  }
  const attributes = readOrRefuse(element, [
    'depth',
    'height',
    'lspace',
    'mathbackground',
    'style',
    'voffset',
    'width',
  ]);
  const border = attributes.get('style');
  if (border !== undefined && !/^border: [\d.]+em solid [^;]+$/u.test(border)) {
    refuse(element);
  }
  if (attributes.has('mathbackground') || border !== undefined) {
    context.lost.add('color');
  }
  context.lost.add('spacing');
  return row(childrenOf(element), context);
};

const accentOf = (element: Element, mark: Element) => {
  if (!isLeaf(mark)) return undefined;
  const key = `${signature(element)}>${signature(mark)}`;
  return (
    MATHML_TEX_ACCENTS.math[key]?.[textOf(mark)] ??
    MATHML_TEX_ACCENTS.text[key]?.[textOf(mark)]
  );
};

/** A brace such as `\overbrace`, whose scripts KaTeX sets over its mark. */
const isBrace = (element: Element) =>
  (element.localName === 'mover' || element.localName === 'munder') &&
  !element.hasAttribute('accent') &&
  !element.hasAttribute('accentunder') &&
  element.children.length === 2 &&
  accentOf(element, element.children[1]) !== undefined;

const scripts = (
  context: Context,
  sub: Element | undefined,
  sup: Element | undefined
) => {
  const inner = scriptContext(context);
  const script = (prefix: string, part: Element | undefined) =>
    part === undefined ? '' : prefix + scriptArgument(row([part], inner));
  return `${script('_', sub)}${script('^', sup)}`;
};

const attach = (
  element: Element,
  context: Context,
  { sub, sup }: { sub?: Element; sup?: Element }
): Tex => {
  readOrRefuse(element, ['subscriptshift', 'superscriptshift']);
  const [first] = Array.from(element.children);
  const operator = operatorOf(first, context);
  const head = operator
    ? join([
        operator.tex,
        context.displayStyle && operator.displayLimits ? '\\nolimits' : '',
      ])
    : base(row([first], context));
  return { tex: head + scripts(context, sub, sup), unit: false };
};

const underOver = (
  element: Element,
  context: Context,
  { over, under }: { over?: Element; under?: Element }
): Tex => {
  readOrRefuse(element, ['accent', 'accentunder', 'align']);
  const [first] = Array.from(element.children);
  const mark = over ?? under;
  if (mark !== undefined && (over === undefined || under === undefined)) {
    const accent = accentOf(element, mark);
    if (accent !== undefined) {
      return unit(`${pick(accent, context)}{${row([first], context).tex}}`);
    }
  }
  if (isLeaf(first) && first.localName === 'mo') {
    const arrow = MATHML_TEX_ARROWS[signature(first)]?.[textOf(first)];
    const labels = [under, over].filter((label) => label !== undefined);
    if (
      arrow !== undefined &&
      labels.every(
        (label) => signature(label) === MATHML_TEX_ARROW_LABEL_SIGNATURE
      )
    ) {
      const label = (part: Element | undefined) =>
        part === undefined ? '' : row(childrenOf(part), context).tex;
      const below = under === undefined ? '' : optional(label(under));
      return unit(`${pick(arrow, context)}${below}{${label(over)}}`);
    }
  }
  const operator = operatorOf(first, context);
  if (operator !== undefined) {
    // MathML Core sets a movable operator's scripts beside it outside display style.
    if (
      !context.displayStyle &&
      first.getAttribute('movablelimits') === 'true'
    ) {
      return { tex: operator.tex + scripts(context, under, over), unit: false };
    }
    // `\operatorname*` sets its scripts under and over in display style only.
    const starred = operator.limitsTex !== operator.tex;
    const placed = context.displayStyle && (operator.displayLimits || starred);
    const head = join([operator.limitsTex, placed ? '' : '\\limits']);
    return { tex: head + scripts(context, under, over), unit: false };
  }
  if (isBrace(first)) {
    return {
      tex: base(row([first], context)) + scripts(context, under, over),
      unit: false,
    };
  }
  const inner = scriptContext(context);
  let { tex } = row([first], context);
  if (under !== undefined) {
    tex = `\\underset{${row([under], inner).tex}}{${tex}}`;
  }
  if (over !== undefined) tex = `\\overset{${row([over], inner).tex}}{${tex}}`;
  return unit(tex);
};

const multiscripts = (element: Element, context: Context): Tex => {
  readOrRefuse(element, ['subscriptshift', 'superscriptshift']);
  const [first, ...rest] = childrenOf(element);
  if (first === undefined) refuse(element);
  const split = rest.findIndex((child) => child.localName === 'mprescripts');
  const post = split === -1 ? rest : rest.slice(0, split);
  const pre = split === -1 ? [] : rest.slice(split + 1);
  if (post.length % 2 === 1 || pre.length % 2 === 1) refuse(element);
  const pairs = (list: Element[]) => {
    const parts: string[] = [];
    for (let index = 0; index < list.length; index += 2) {
      const [sub, sup] = [list[index], list[index + 1]].map((script) =>
        script.localName === 'none' ? undefined : script
      );
      parts.push(scripts(context, sub, sup));
    }
    return parts;
  };
  const before = pairs(pre).map((script) => `{}${script}`);
  const [attached, ...after] = pairs(post);
  return {
    tex: join([
      ...before,
      base(row([first], context)) + (attached ?? ''),
      ...after.map((script) => `{}${script}`),
    ]),
    unit: false,
  };
};

const fencedElement = (element: Element, context: Context): Tex => {
  const attributes = readOrRefuse(element, ['close', 'open', 'separators']);
  const children = childrenOf(element);
  const separators = Array.from(
    (attributes.get('separators') ?? ',').replaceAll(/\s/gu, '')
  );
  const parts = ['\\left', delimiter(attributes.get('open') ?? '(', context)];
  children.forEach((child, index) => {
    if (index > 0 && separators.length > 0) {
      const ch = separators[Math.min(index - 1, separators.length - 1)];
      parts.push(character(element, 'mo', ch, context));
    }
    parts.push(row([child], context).tex);
  });
  parts.push(
    '\\right',
    delimiter(attributes.get('close') ?? ')', context, true)
  );
  return unit(join(parts));
};

const action = (element: Element, context: Context): Tex => {
  const attributes = readOrRefuse(element, ['actiontype', 'selection']);
  const selection = attributes.get('selection');
  if (selection !== undefined && selection !== '1') refuse(element);
  const [first, ...rest] = childrenOf(element);
  if (first === undefined) refuse(element);
  for (const child of rest) context.lost.add(`maction <${child.localName}>`);
  return row([first], context);
};

const semantics = (element: Element, context: Context): Tex => {
  const children = childrenOf(element);
  const [first] = children;
  if (
    first !== undefined &&
    isMathmlName(first.localName) &&
    first.localName !== 'annotation' &&
    first.localName !== 'annotation-xml'
  ) {
    return row([first], context);
  }
  const presentation = children.find(
    (child) =>
      child.localName === 'annotation-xml' &&
      PRESENTATION_ENCODING.test(child.getAttribute('encoding') ?? '')
  );
  return presentation === undefined
    ? refuse(element)
    : row(childrenOf(presentation), context);
};

const isAttributelessMoHoldingOneElement = (element: Element) =>
  element.localName === 'mo' &&
  attributesOf(element).size === 0 &&
  element.children.length === 1;

const token: MathmlRule = (element, context) => {
  if (!isLeaf(element)) {
    if (element.localName === 'mtext') refuse(element);
    const children = childrenOf(element);
    if (isAttributelessMoHoldingOneElement(element)) {
      return unit(`\\mathop{${row(children, context).tex}}`);
    }
    const named = wrapped(element, MATHML_TEX_CLASSES, context);
    if (named !== undefined) return named;
    if (element.localName === 'mi' && attributesOf(element).size === 0) {
      return unit(`\\mathord{${row(children, context).tex}}`);
    }
    return refuse(element);
  }
  if (element.localName === 'mtext') return mtext(element, context);
  const attributes = tokenAttributes(element);
  const tex = leaf(element, element.localName, attributes, context);
  // MathML Core draws the letters of an `mn` upright.
  return element.localName === 'mn' &&
    !attributes.has('mathvariant') &&
    /[A-Za-z]/u.test(textOf(element))
    ? unit(`\\mathrm{${tex.tex}}`)
    : tex;
};

const RULES: Record<MathmlElementName, MathmlRule> = withoutPrototype({
  annotation: refuse,
  'annotation-xml': refuse,
  maction: action,
  math: refuse,
  menclose: (element, context) => {
    const named = wrapped(element, MATHML_TEX_ENCLOSURES, context);
    if (named !== undefined) return named;
    readOrRefuse(element, ['notation']);
    context.lost.add('enclosure');
    return row(childrenOf(element), context);
  },
  merror: refuse,
  mfenced: fencedElement,
  mfrac: (element, context) => {
    const attributes = readOrRefuse(element, ['bevelled', 'linethickness']);
    const [numerator, denominator] = exactly(element, 2).map((part) =>
      row([part], scriptContext(context))
    );
    if (attributes.has('bevelled')) context.lost.add('size');
    const thickness = attributes.get('linethickness');
    if (thickness === undefined) {
      return unit(join(['\\frac', argument(numerator), argument(denominator)]));
    }
    const width = emWidth(thickness);
    if (/^0(?:\.0*)?(?:px|em|pt)?$/u.test(thickness)) {
      return group(`${base(numerator)} \\atop ${base(denominator)}`);
    }
    if (width !== undefined) {
      return group(
        `${base(numerator)} \\above{${roundTripEm(width, context)}} ${base(denominator)}`
      );
    }
    context.lost.add('size');
    return unit(join(['\\frac', argument(numerator), argument(denominator)]));
  },
  mglyph: refuse,
  mi: token,
  mlabeledtr: refuse,
  mlongdiv: refuse,
  mmultiscripts: multiscripts,
  mn: token,
  mo: token,
  mover: (element, context) => {
    const [, over] = exactly(element, 2);
    return underOver(element, context, { over });
  },
  mpadded: padded,
  mphantom: (element, context) => {
    const named = wrapped(element, MATHML_TEX_PADDING, context);
    return named ?? refuse(element);
  },
  mprescripts: refuse,
  mroot: (element, context) => {
    readOrRefuse(element, []);
    const [radicand, index] = exactly(element, 2);
    const degree = row([index], scriptContext(context));
    return unit(
      `\\sqrt${optional(degree.tex)}{${row([radicand], context).tex}}`
    );
  },
  mrow: (element, context) => {
    readOrRefuse(element, []);
    const children = childrenOf(element);
    return fenced(children, context) ?? group(row(children, context).tex);
  },
  ms: (element, context) => {
    const attributes = readOrRefuse(element, ['lquote', 'rquote']);
    const quoted = `${attributes.get('lquote') ?? '"'}${textOf(element)}${attributes.get('rquote') ?? '"'}`;
    return unit(`\\text{${textRun(element, quoted, context)}}`);
  },
  mscarries: refuse,
  mscarry: refuse,
  msgroup: refuse,
  msline: refuse,
  mspace,
  msqrt: (element, context) => {
    readOrRefuse(element, []);
    return unit(`\\sqrt{${row(childrenOf(element), context).tex}}`);
  },
  msrow: refuse,
  mstack: refuse,
  mstyle: style,
  msub: (element, context) => {
    const [, sub] = exactly(element, 2);
    return attach(element, context, { sub });
  },
  msubsup: (element, context) => {
    const [, sub, sup] = exactly(element, 3);
    return attach(element, context, { sub, sup });
  },
  msup: (element, context) => {
    const [, sup] = exactly(element, 2);
    return attach(element, context, { sup });
  },
  mtable: (table, context) =>
    environmentOf(table, '', '', context) ??
    tagged(table, context) ??
    matrix(table, context),
  mtd: refuse,
  mtext: token,
  mtr: refuse,
  munder: (element, context) => {
    const [, under] = exactly(element, 2);
    return underOver(element, context, { under });
  },
  munderover: (element, context) => {
    const [, under, over] = exactly(element, 3);
    return underOver(element, context, { over, under });
  },
  none: (element) => {
    exactly(element, 0);
    return unit('{}');
  },
  semantics,
});

const isMathmlName = (name: string): name is MathmlElementName =>
  Object.hasOwn(RULES, name);

const convert = (element: Element, context: Context): Tex =>
  isMathmlName(element.localName)
    ? RULES[element.localName](element, context)
    : refuse(element);

export const rebuildTexFromMathml = (
  math: Element,
  display: 'block' | 'inline'
): MathmlTex => {
  const context: Context = {
    block: display === 'block',
    displayStyle: display === 'block',
    lost: new Set(),
    picks: new Map(),
    emScale: 1,
  };
  try {
    const body = row(childrenOf(math), context);
    const tex = body.unbraced ?? body.tex;
    if (tex.trim() === '') refuse(math);
    const picks = [...context.picks.values()];
    return context.lost.size > 0
      ? { kind: 'approximate', lost: [...context.lost], picks, tex }
      : { kind: 'exact', picks, tex };
  } catch (error) {
    if (error instanceof RefusalError) {
      return { element: error.element, kind: 'refused' };
    }
    throw error;
  }
};
