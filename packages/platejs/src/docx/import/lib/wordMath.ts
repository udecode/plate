import { type Descendant, TextApi } from '../../../core';
import type { DocxDiagnostic } from '../../internal/types';
import {
  WORD_MATH_ACCENTS,
  WORD_MATH_VARIANTS,
} from '../../internal/wordMathVocabulary';

const MATH_NAMESPACE =
  'http://schemas.openxmlformats.org/officeDocument/2006/math';
const WORD_NAMESPACE =
  'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';

type EquationMarkers = Readonly<{
  block: string;
  end: string;
  inline: string;
}>;

const elements = (element: Element) => Array.from(element.children);

const descendants = (element: Element): Element[] =>
  elements(element).flatMap((child) => [child, ...descendants(child)]);

const isMath = (element: Element, name: string) =>
  element.namespaceURI === MATH_NAMESPACE && element.localName === name;

const isWord = (element: Element, name: string) =>
  element.namespaceURI === WORD_NAMESPACE && element.localName === name;

const childNamed = (element: Element, name: string) =>
  elements(element).find((child) => isMath(child, name));

const mathValue = (element: Element | undefined) =>
  element?.getAttributeNS(MATH_NAMESPACE, 'val') ??
  element?.getAttribute('m:val') ??
  undefined;

const propertyValue = (element: Element, property: string) => {
  const properties = childNamed(element, `${element.localName}Pr`);

  return mathValue(properties && childNamed(properties, property));
};

const runText = (element: Element) =>
  descendants(element)
    .filter((child) => child.localName === 't')
    .map((text) => text.textContent ?? '')
    .join('');

const MATH_ESCAPES: Readonly<Record<string, string>> = {
  '\u00A0': '\\ ',
  '\u2003': '\\quad ',
  '\u2009': '\\,',
  '#': '\\#',
  $: '\\$',
  '%': '\\%',
  '&': '\\&',
  '\\': '\\backslash ',
  '^': '\\char"5E ',
  _: '\\_',
  '{': '\\{',
  '}': '\\}',
  '~': '\\char"7E ',
};

const TEXT_ESCAPES: Readonly<Record<string, string>> = {
  ...MATH_ESCAPES,
  '\u00A0': ' ',
  '\\': '\\textbackslash{}',
  '^': '\\textasciicircum{}',
  '~': '\\textasciitilde{}',
};

const escape = (text: string, escapes: Readonly<Record<string, string>>) =>
  Array.from(text.replaceAll('⁡', ''))
    .map((char) => escapes[char] ?? char)
    .join('');

/** Every delimiter KaTeX's \left accepts, as the TeX that draws it. */
const DELIMITERS: Readonly<Record<string, string>> = {
  '': '.',
  '(': '(',
  ')': ')',
  '/': '/',
  '<': '<',
  '>': '>',
  '[': '[',
  '\\': '\\backslash',
  ']': ']',
  '{': '\\{',
  '|': '|',
  '}': '\\}',
  '‖': '\\|',
  '↑': '\\uparrow',
  '↓': '\\downarrow',
  '↕': '\\updownarrow',
  '⇑': '\\Uparrow',
  '⇓': '\\Downarrow',
  '⇕': '\\Updownarrow',
  '∣': '|',
  '∥': '\\|',
  '⌈': '\\lceil',
  '⌉': '\\rceil',
  '⌊': '\\lfloor',
  '⌋': '\\rfloor',
  '⎰': '\\lmoustache',
  '⎱': '\\rmoustache',
  '⟨': '\\langle',
  '⟩': '\\rangle',
  '⟮': '\\lgroup',
  '⟯': '\\rgroup',
};

/** A named delimiter ends with a space, so the letters after it stay apart. */
const delimiter = (char: string) => {
  const tex = DELIMITERS[char];

  return tex && /[a-z]$/i.test(tex) ? `${tex} ` : tex;
};

const LARGE_OPERATORS = new Set('∑∏∐∫∬∭∮⋀⋁⋂⋃⨀⨁⨂⨄⨆');

const FUNCTIONS = new Set([
  'arccos',
  'arcsin',
  'arctan',
  'arg',
  'cos',
  'cosh',
  'cot',
  'coth',
  'csc',
  'deg',
  'det',
  'dim',
  'exp',
  'gcd',
  'hom',
  'inf',
  'ker',
  'lg',
  'lim',
  'liminf',
  'limsup',
  'ln',
  'log',
  'max',
  'min',
  'Pr',
  'sec',
  'sin',
  'sinh',
  'sup',
  'tan',
  'tanh',
]);

const largeOperator = (element: Element | undefined) => {
  const base = element && childNamed(element, 'e');
  const [only] = base ? elements(base) : [];

  return only && isMath(only, 'r') && LARGE_OPERATORS.has(runText(only))
    ? runText(only)
    : null;
};

/** Word math as TeX; `onUnknown` hears about structure only its text survives. */
const toTex = (
  element: Element,
  onUnknown: (name: string) => void,
  inFunctionName = false
): string => {
  const join = (node: Element, functionName = inFunctionName) =>
    elements(node)
      .map((child) => toTex(child, onUnknown, functionName))
      .join('');
  const part = (name: string) => {
    const child = childNamed(element, name);

    return child ? toTex(child, onUnknown, inFunctionName) : '';
  };

  if (element.namespaceURI !== MATH_NAMESPACE) {
    return isWord(element, 'r') ? escape(runText(element), MATH_ESCAPES) : '';
  }
  if (element.localName.endsWith('Pr')) return '';
  switch (element.localName) {
    case 'oMathPara':
    case 'oMath':
    case 'e':
    case 'num':
    case 'den':
    case 'sub':
    case 'sup':
    case 'deg':
    case 'lim':
    case 'box': {
      return join(element);
    }
    case 'fName': {
      return join(element, true);
    }
    case 'r': {
      const text = runText(element);
      const properties = childNamed(element, 'rPr');

      if (properties && childNamed(properties, 'nor')) {
        return `\\text{${escape(text, TEXT_ESCAPES)}}`;
      }
      const scr = mathValue(properties && childNamed(properties, 'scr'));
      const sty = mathValue(properties && childNamed(properties, 'sty'));

      if ((sty === 'p' || inFunctionName) && FUNCTIONS.has(text)) {
        return `\\${text} `;
      }
      // A lone italic letter, or an upright run with no letters, needs no command.
      const plain =
        sty === 'p'
          ? !/\p{L}/u.test(text)
          : sty === 'i' && /^\p{L}$/u.test(text);
      const variant =
        scr || (sty && !plain)
          ? (WORD_MATH_VARIANTS.find(
              (entry) =>
                (entry.scr ?? null) === (scr ?? null) && entry.sty === sty
            ) ?? WORD_MATH_VARIANTS.find((entry) => scr && entry.scr === scr))
          : undefined;

      return variant
        ? `${variant.tex}{${escape(text, MATH_ESCAPES)}}`
        : escape(text, MATH_ESCAPES);
    }
    case 'f': {
      const type = propertyValue(element, 'type');
      const parts = `{${part('num')}}{${part('den')}}`;

      if (type === 'noBar') return `\\genfrac{}{}{0pt}{}${parts}`;
      if (type === 'lin') return `${part('num')}/${part('den')}`;

      return `\\frac${parts}`;
    }
    case 'sSup': {
      return `{${part('e')}}^{${part('sup')}}`;
    }
    case 'sSub': {
      return `{${part('e')}}_{${part('sub')}}`;
    }
    case 'sSubSup': {
      return `{${part('e')}}_{${part('sub')}}^{${part('sup')}}`;
    }
    case 'rad': {
      const degree = part('deg');

      return propertyValue(element, 'degHide') === '1' || !degree
        ? `\\sqrt{${part('e')}}`
        : `\\sqrt[${degree}]{${part('e')}}`;
    }
    case 'nary': {
      const operator = propertyValue(element, 'chr') ?? '∫';
      const sub = propertyValue(element, 'subHide') === '1' ? '' : part('sub');
      const sup = propertyValue(element, 'supHide') === '1' ? '' : part('sup');

      return `${operator}${sub ? `_{${sub}}` : ''}${sup ? `^{${sup}}` : ''}{${part('e')}}`;
    }
    case 'd': {
      const openChar = propertyValue(element, 'begChr') ?? '(';
      const closeChar = propertyValue(element, 'endChr') ?? ')';
      const [open, close] = [openChar, closeChar].map(delimiter);
      const separator = escape(
        propertyValue(element, 'sepChr') ?? '|',
        MATH_ESCAPES
      );
      const items = elements(element)
        .filter((child) => isMath(child, 'e'))
        .map((child) => join(child));

      if (open === undefined || close === undefined) {
        onUnknown('d');

        return `${escape(openChar, MATH_ESCAPES)}${items.join(separator)}${escape(closeChar, MATH_ESCAPES)}`;
      }

      return `\\left${open}${items.join(` ${separator} `)}\\right${close}`;
    }
    case 'acc': {
      const char = propertyValue(element, 'chr') ?? '̂';
      const accent = WORD_MATH_ACCENTS.find(
        (entry) => entry.combining === char
      );

      if (!accent) onUnknown('acc');

      return accent ? `${accent.tex}{${part('e')}}` : part('e');
    }
    case 'bar': {
      return propertyValue(element, 'pos') === 'bot'
        ? `\\underline{${part('e')}}`
        : `\\overline{${part('e')}}`;
    }
    case 'limLow': {
      const operator = largeOperator(element);

      return operator
        ? `${operator}_{${part('lim')}}`
        : `\\underset{${part('lim')}}{${part('e')}}`;
    }
    case 'limUpp': {
      const base = childNamed(element, 'e');
      const [lower] = base ? elements(base) : [];
      const operator =
        lower && isMath(lower, 'limLow')
          ? largeOperator(lower)
          : largeOperator(element);

      if (operator && lower && isMath(lower, 'limLow')) {
        return `${operator}_{${toTex(childNamed(lower, 'lim') ?? lower, onUnknown)}}^{${part('lim')}}`;
      }

      return operator
        ? `${operator}^{${part('lim')}}`
        : `\\overset{${part('lim')}}{${part('e')}}`;
    }
    case 'func': {
      return `${part('fName')}${part('e')}`;
    }
    case 'borderBox': {
      return `\\boxed{${part('e')}}`;
    }
    default: {
      onUnknown(element.localName);

      return escape(runText(element), MATH_ESCAPES);
    }
  }
};

/** An equation of normal-text runs only is TeX the exporter kept verbatim. */
const verbatimTex = (math: Element) => {
  const nodes = descendants(math).filter(
    (node) => node.namespaceURI === MATH_NAMESPACE
  );
  const runs = nodes.filter((node) => node.localName === 'r');
  const structured = nodes.some(
    (node) =>
      !['oMath', 'r', 'rPr', 'nor', 't', 'ctrlPr'].includes(node.localName)
  );

  return runs.length > 0 &&
    !structured &&
    runs.every((run) => {
      const properties = childNamed(run, 'rPr');

      return properties && childNamed(properties, 'nor');
    })
    ? runs.map(runText).join('')
    : null;
};

const flattenRevisions = (math: Element) => {
  let flattened = 0;

  for (const revision of descendants(math).filter(
    (node) => node.namespaceURI === WORD_NAMESPACE
  )) {
    if (!revision.parentNode) continue;
    if (['del', 'moveFrom', 'rPrChange'].includes(revision.localName)) {
      revision.remove();
      flattened += 1;
    } else if (['ins', 'moveTo'].includes(revision.localName)) {
      while (revision.firstChild) revision.before(revision.firstChild);
      revision.remove();
      flattened += 1;
    }
  }

  return flattened;
};

/**
 * Replace each Word equation in a part with one text run holding its TeX
 * between equation markers, before Mammoth reads the part and drops its math.
 */
export const instrumentWordMath = (
  document: Document,
  markers: EquationMarkers,
  diagnostics: DocxDiagnostic[],
  part: string
) => {
  const equations: Element[] = [];
  const pending: Element[] = document.documentElement
    ? [document.documentElement]
    : [];

  for (let element = pending.pop(); element; element = pending.pop()) {
    if (isMath(element, 'oMathPara') || isMath(element, 'oMath')) {
      equations.push(element);
    } else {
      for (
        let child = element.firstElementChild;
        child;
        child = child.nextElementSibling
      ) {
        pending.push(child);
      }
    }
  }
  let simplified = false;

  for (const math of equations) {
    const ends: Element[] = [];

    for (const marker of descendants(math).filter(
      (node) => node.namespaceURI === WORD_NAMESPACE
    )) {
      if (marker.localName === 'commentRangeStart') {
        math.before(marker);
      } else if (
        marker.localName === 'commentRangeEnd' ||
        (marker.localName === 'r' &&
          descendants(marker).some(
            (node) => node.localName === 'commentReference'
          ))
      ) {
        ends.push(marker);
      }
    }
    math.after(...ends);
    if (flattenRevisions(math) > 0) {
      diagnostics.push({
        action: 'replaced',
        code: 'unsupported-content',
        feature: 'tracked-revision',
        message: 'A tracked revision inside an equation was flattened.',
        part,
        severity: 'warning',
      });
    }
    const tex =
      verbatimTex(math) ??
      toTex(math, () => {
        simplified = true;
      });

    if (!tex.trim()) {
      math.remove();
      continue;
    }
    const run = document.createElementNS(WORD_NAMESPACE, 'w:r');
    const text = document.createElementNS(WORD_NAMESPACE, 'w:t');

    text.setAttributeNS(XML_NAMESPACE, 'xml:space', 'preserve');
    text.textContent = `${math.localName === 'oMathPara' ? markers.block : markers.inline}${tex}${markers.end}`;
    run.append(text);
    math.replaceWith(run);
  }
  if (simplified) {
    diagnostics.push({
      code: 'converter-message',
      message: 'An equation used Word math that imports as its text only.',
      severity: 'warning',
    });
  }
};

type Equation = Readonly<{ block: boolean; tex: string }>;

const splitEquations = (text: string, markers: EquationMarkers) => {
  const pieces: Array<Equation | string> = [];
  let rest = text;

  for (;;) {
    const block = rest.indexOf(markers.block);
    const inline = rest.indexOf(markers.inline);
    const start =
      block === -1 ? inline : inline === -1 ? block : Math.min(block, inline);

    if (start === -1) break;
    const marker = start === block ? markers.block : markers.inline;
    const end = rest.indexOf(markers.end, start + marker.length);

    if (end === -1) break;
    pieces.push(rest.slice(0, start), {
      block: marker === markers.block,
      tex: rest.slice(start + marker.length, end),
    });
    rest = rest.slice(end + markers.end.length);
  }
  pieces.push(rest);

  return pieces;
};

export const materializeEquations = (
  nodes: readonly Descendant[],
  markers: EquationMarkers,
  kinds: Readonly<{ block: boolean; inline: boolean }>
): Descendant[] =>
  nodes.flatMap((node): Descendant[] => {
    if (TextApi.isText(node)) {
      const pieces = splitEquations(node.text, markers);

      // TeX kept as text stays in this leaf, so comment markers beside it keep their offsets.
      if (!kinds.inline) {
        return [
          {
            ...node,
            text: pieces
              .map((piece) => (typeof piece === 'string' ? piece : piece.tex))
              .join(''),
          },
        ];
      }

      return pieces.map((piece) =>
        typeof piece === 'string'
          ? { ...node, text: piece }
          : {
              children: [{ text: '' }],
              latex: piece.tex,
              type: 'inlineEquation',
            }
      );
    }
    const [before, equation, after, ...rest] =
      node.children.length === 1 && TextApi.isText(node.children[0])
        ? splitEquations(node.children[0].text, markers)
        : [];

    if (
      kinds.block &&
      rest.length === 0 &&
      before === '' &&
      after === '' &&
      typeof equation === 'object' &&
      equation.block
    ) {
      return [
        { children: [{ text: '' }], latex: equation.tex, type: 'equation' },
      ] as Descendant[];
    }

    return [
      {
        ...node,
        children: materializeEquations(node.children, markers, kinds),
      },
    ];
  });
