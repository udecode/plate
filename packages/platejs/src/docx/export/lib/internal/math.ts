import { fragment } from 'xmlbuilder2';
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces';

import {
  WORD_MATH_ACCENTS,
  WORD_MATH_VARIANTS,
} from '../../../internal/wordMathVocabulary';
import namespaces from './namespaces';

type MathNode = {
  children?: MathNode[];
  properties?: { attributes?: Record<string, string> };
  tagName?: string;
  text?: string;
};

class UnsupportedError extends Error {
  override name = 'UnsupportedError';
}

/**
 * Accepted on any element: Word math spaces and sizes math by itself,
 * `isFence` reads `fence`, and `xmlns` draws nothing.
 */
const LAYOUT_ATTRIBUTES = new Set([
  'fence',
  'form',
  'largeop',
  'lspace',
  'maxsize',
  'minsize',
  'movablelimits',
  'rspace',
  'separator',
  'stretchy',
  'symmetric',
  'xmlns',
]);

const MEANINGFUL_ATTRIBUTES: Readonly<Record<string, readonly string[]>> = {
  annotation: ['encoding'],
  math: ['display'],
  menclose: ['notation'],
  mfrac: ['linethickness'],
  mi: ['mathvariant'],
  mn: ['mathvariant'],
  mo: ['mathvariant'],
  mover: ['accent'],
  mspace: ['width'],
  mstyle: ['displaystyle', 'scriptlevel'],
  munder: ['accentunder'],
};

const attribute = (node: MathNode, name: string) =>
  node.properties?.attributes?.[name];

/** The line KaTeX draws for `\overline` and `\underline`. */
const BAR_CHARS = new Set(['‾', '¯', '_', '\u0332']);

const children = (node: MathNode) =>
  (node.children ?? []).filter((child) => child.tagName !== undefined);

const textOf = (node: MathNode): string =>
  node.tagName === undefined
    ? (node.text ?? '')
    : (node.children ?? []).map((child) => textOf(child)).join('');

const escapeXml = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const run = (text: string, properties = '') =>
  `<m:r>${properties ? `<m:rPr>${properties}</m:rPr>` : ''}<m:t xml:space="preserve">${escapeXml(text)}</m:t></m:r>`;

const checkAttributes = (node: MathNode) => {
  const allowed = MEANINGFUL_ATTRIBUTES[node.tagName ?? ''] ?? [];

  for (const name of Object.keys(node.properties?.attributes ?? {})) {
    if (!LAYOUT_ATTRIBUTES.has(name) && !allowed.includes(name)) {
      throw new UnsupportedError(name);
    }
  }
};

const arity = (node: MathNode, count: number) => {
  const items = children(node);

  if (items.length !== count) throw new UnsupportedError(node.tagName);

  return items;
};

const token = (node: MathNode) => {
  const text = textOf(node);
  const mathvariant = attribute(node, 'mathvariant');

  if (mathvariant) {
    const variant = WORD_MATH_VARIANTS.find(
      (entry) => entry.mathvariant === mathvariant
    );

    if (!variant) throw new UnsupportedError(mathvariant);

    return run(
      text,
      `${variant.scr ? `<m:scr m:val="${variant.scr}"/>` : ''}${variant.sty ? `<m:sty m:val="${variant.sty}"/>` : ''}`
    );
  }

  // A multi-letter identifier, such as KaTeX's `sin`, is upright in TeX.
  return run(
    text,
    node.tagName === 'mi' && Array.from(text).length > 1
      ? '<m:sty m:val="p"/>'
      : ''
  );
};

/** A brace KaTeX stretches over its base, which a Word limit draws as text. */
const isStretchy = (node: MathNode) =>
  node.tagName === 'mo' && attribute(node, 'stretchy') === 'true';

const isFence = (node: MathNode | undefined) =>
  node?.tagName === 'mo' && attribute(node, 'fence') === 'true';

const join = (nodes: MathNode[]) => nodes.map((node) => convert(node)).join('');

const convert = (node: MathNode): string => {
  checkAttributes(node);
  switch (node.tagName) {
    case 'mrow': {
      const items = children(node);
      const inner = items.slice(1, -1);

      if (items.length < 2 || !isFence(items[0]) || !isFence(items.at(-1))) {
        return join(items);
      }
      if (inner.some(isFence)) throw new UnsupportedError('middle fence');

      return `<m:d><m:dPr><m:begChr m:val="${escapeXml(textOf(items[0]))}"/><m:endChr m:val="${escapeXml(textOf(items.at(-1) ?? {}))}"/></m:dPr><m:e>${join(inner)}</m:e></m:d>`;
    }
    case 'mstyle': {
      return join(children(node));
    }
    case 'mi':
    case 'mn':
    case 'mo': {
      // KaTeX wraps a stacked symbol, such as `\overset{+}{=}`, in a token element.
      if (children(node).length > 0) return join(children(node));

      return textOf(node) === '\u2061' ? '' : token(node);
    }
    case 'mtext': {
      return run(textOf(node), '<m:nor/>');
    }
    case 'mspace': {
      const width = Number.parseFloat(attribute(node, 'width') ?? '0');

      // Wider than this, the equation keeps its TeX instead of a long run of em spaces.
      if (width > 100) throw new UnsupportedError('width');
      if (width >= 1) return run('\u2003'.repeat(Math.round(width)));

      return width > 0 ? run('\u2009') : '';
    }
    case 'mfrac': {
      const [numerator, denominator] = arity(node, 2);
      const thickness = attribute(node, 'linethickness');

      if (thickness !== undefined && Number.parseFloat(thickness) !== 0) {
        throw new UnsupportedError('linethickness');
      }

      return `<m:f>${thickness === undefined ? '' : '<m:fPr><m:type m:val="noBar"/></m:fPr>'}<m:num>${convert(numerator)}</m:num><m:den>${convert(denominator)}</m:den></m:f>`;
    }
    case 'msqrt': {
      return `<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e>${join(children(node))}</m:e></m:rad>`;
    }
    case 'mroot': {
      const [base, degree] = arity(node, 2);

      return `<m:rad><m:deg>${convert(degree)}</m:deg><m:e>${convert(base)}</m:e></m:rad>`;
    }
    case 'msub': {
      const [base, sub] = arity(node, 2);

      return `<m:sSub><m:e>${convert(base)}</m:e><m:sub>${convert(sub)}</m:sub></m:sSub>`;
    }
    case 'msup': {
      const [base, sup] = arity(node, 2);

      return `<m:sSup><m:e>${convert(base)}</m:e><m:sup>${convert(sup)}</m:sup></m:sSup>`;
    }
    case 'msubsup': {
      const [base, sub, sup] = arity(node, 3);

      return `<m:sSubSup><m:e>${convert(base)}</m:e><m:sub>${convert(sub)}</m:sub><m:sup>${convert(sup)}</m:sup></m:sSubSup>`;
    }
    case 'mover': {
      const [base, over] = arity(node, 2);

      if (attribute(node, 'accent') !== 'true') {
        if (isStretchy(over)) throw new UnsupportedError('stretchy');

        return `<m:limUpp><m:e>${convert(base)}</m:e><m:lim>${convert(over)}</m:lim></m:limUpp>`;
      }
      const char = textOf(over);

      if (BAR_CHARS.has(char)) {
        return `<m:bar><m:barPr><m:pos m:val="top"/></m:barPr><m:e>${convert(base)}</m:e></m:bar>`;
      }
      const accent = WORD_MATH_ACCENTS.find((entry) =>
        entry.chars.includes(char)
      );

      if (!accent) throw new UnsupportedError(char);

      return `<m:acc><m:accPr><m:chr m:val="${accent.combining}"/></m:accPr><m:e>${convert(base)}</m:e></m:acc>`;
    }
    case 'munder': {
      const [base, under] = arity(node, 2);

      if (attribute(node, 'accentunder') !== 'true') {
        if (isStretchy(under)) throw new UnsupportedError('stretchy');

        return `<m:limLow><m:e>${convert(base)}</m:e><m:lim>${convert(under)}</m:lim></m:limLow>`;
      }
      if (!BAR_CHARS.has(textOf(under))) {
        throw new UnsupportedError(textOf(under));
      }

      return `<m:bar><m:barPr><m:pos m:val="bot"/></m:barPr><m:e>${convert(base)}</m:e></m:bar>`;
    }
    case 'munderover': {
      const [base, under, over] = arity(node, 3);

      return `<m:limUpp><m:e><m:limLow><m:e>${convert(base)}</m:e><m:lim>${convert(under)}</m:lim></m:limLow></m:e><m:lim>${convert(over)}</m:lim></m:limUpp>`;
    }
    case 'menclose': {
      if (attribute(node, 'notation') !== 'box') {
        throw new UnsupportedError('notation');
      }

      return `<m:borderBox><m:e>${join(children(node))}</m:e></m:borderBox>`;
    }
    default: {
      throw new UnsupportedError(node.tagName);
    }
  }
};

const NORMAL_TEXT_ONLY =
  /^(?:<m:r><m:rPr><m:nor\/><\/m:rPr><m:t xml:space="preserve">[^<]*<\/m:t><\/m:r>)+$/;

const presentationOf = (math: MathNode) => {
  const [first] = children(math);
  const items =
    first?.tagName === 'semantics'
      ? children(first).filter((child) => child.tagName !== 'annotation')
      : children(math);

  if (items.length === 0) throw new UnsupportedError('empty');

  return items.length === 1 ? items[0] : { children: items, tagName: 'mrow' };
};

const texOf = (math: MathNode): string => {
  for (const child of children(math)) {
    if (
      child.tagName === 'annotation' &&
      attribute(child, 'encoding') === 'application/x-tex'
    ) {
      return textOf(child);
    }
    const nested = texOf(child);

    if (nested) return nested;
  }

  return '';
};

/**
 * Anything Word math cannot express becomes one normal-text run holding the
 * TeX. An all-text equation takes the same shape, so import can read it back.
 */
export const buildMath = (math: MathNode): XMLBuilder => {
  let body: string;

  try {
    checkAttributes(math);
    body = convert(presentationOf(math));
    if (NORMAL_TEXT_ONLY.test(body)) throw new UnsupportedError('text only');
  } catch (error) {
    if (!(error instanceof UnsupportedError)) throw error;
    body = run(texOf(math), '<m:nor/>');
  }

  const omath = `<m:oMath xmlns:m="${namespaces.m}">${body}</m:oMath>`;

  return fragment().ele(
    attribute(math, 'display') === 'block'
      ? `<m:oMathPara xmlns:m="${namespaces.m}">${omath}</m:oMathPara>`
      : omath
  );
};
