import {
  ContentSlice,
  definePlugin,
  HtmlPlugin,
  type Descendant,
  ElementApi,
  PLUGINS,
} from '../../../core';
import { fitsHtmlByteLimit } from '../../../lib/plugins/html/htmlAst';
import {
  getHtmlComments,
  isHtmlComment,
  removeHtmlNodesBetweenComments,
  traverseHtmlElements,
  traverseHtmlNode,
} from '../../../lib/plugins/html/htmlDom';
import { decodePreparedHtmlDataTransfer } from '../../../lib/plugins/html/HtmlPlugin';
import { cleanWordHtml, isWordHtml } from '../../html/cleanWordHtml.internal';
import { parseDocxHtml } from '../../internal/domParser';
import { MARKER_END, MARKER_START } from '../../internal/markerCharacters';
import {
  type EquationMarkers,
  materializeEquations,
  parseClipboardEquation,
} from '../../internal/wordMath';

const WORD_EQUATION_PATTERN =
  /^\[if gte msEquation \d+\]>([\s\S]*)<!\[endif\]$/;

const createEquationMarkers = (html: string): EquationMarkers => {
  let tag = 'WordPasteEquation';

  while (html.includes(tag)) tag += 'x';

  return {
    block: `${MARKER_START}${tag}-block${MARKER_END}`,
    end: `${MARKER_START}${tag}-end${MARKER_END}`,
    inline: `${MARKER_START}${tag}-inline${MARKER_END}`,
  };
};

const markWordEquations = (body: HTMLElement, markers: EquationMarkers) => {
  const comments: Comment[] = [];

  traverseHtmlNode(body, (node) => {
    if (isHtmlComment(node)) comments.push(node);

    return true;
  });
  let equations = 0;
  let fallbacks = 0;
  let readable = 0;

  for (const comment of comments) {
    if (comment.data === '[if !msEquation]') fallbacks += 1;
    const markup = WORD_EQUATION_PATTERN.exec(comment.data)?.[1];

    if (markup === undefined) continue;
    const equation = parseClipboardEquation(markup);

    equations += 1;
    if (equation) readable += 1;
    comment.replaceWith(
      equation
        ? `${equation.block ? markers.block : markers.inline}${equation.tex}${markers.end}`
        : ''
    );
  }
  removeHtmlNodesBetweenComments(body, '[if !msEquation]', '[endif]');

  // Each fallback picture stands in for one equation, so a fallback without a
  // readable equation counts as unread.
  return { unread: readable < Math.max(equations, fallbacks) };
};

const CSS_AT_RULE_PATTERN = /@[^{};]*(?:;|\{(?:[^{}]*\{[^{}]*\})*[^{}]*\})/g;
const CSS_COMMENT_PATTERN =
  /("(?:[^"\\]|\\[\s\S])*"|'(?:[^'\\]|\\[\s\S])*')|\/\*[\s\S]*?\*\/|<!--|-->/g;
const CSS_RULE_PATTERN = /([^{}]+)\{([^{}]*)\}/g;
const CSS_TRAILING_SEPARATOR_PATTERN = /[\s;]+$/;
const DECIMAL_COMPONENT_PATTERN = /^\d+$/;
const LEVEL_PATTERN = /level(\d+)/i;
const LIST_IDENTITY_PATTERN =
  /mso-list:\s*(l\d+)(?:\s+level\d+)?(?:\s+(lfo\d+))?/i;
const LIST_MARKER_PATTERN =
  /^\(?([A-Za-z\d]+(?:\.[A-Za-z\d]+)*)(?:\.(?![A-Za-z\d])|[)\\]|\s|$)/;
const LIST_DECLARATION_PATTERN = /@list\s+(l\d+):level(\d+)\s*\{([^}]*)\}/gi;
const LOWER_ALPHA_PATTERN = /^[a-z]+$/;
const LOWER_ROMAN_PATTERN = /^[cdilmvx]+$/;
const MSO_LIST_PATTERN = /mso-list:\s*l/i;
const MSO_LIST_IGNORE_PATTERN = /mso-list:\s*ignore/i;
const MSO_LEVEL_NUMBER_FORMAT_PATTERN = /mso-level-number-format:\s*([^;}]*)/i;
const NON_NUMERIC_PATTERN = /[^\d,.]+/;
const SELECTOR_CLASS_PATTERN = /\.[\w-]+|\[[^\]]*\]/g;
const SELECTOR_ID_PATTERN = /#[\w-]+/g;
const SELECTOR_TYPE_PATTERN = /(?:^|[\s+>~])[a-z][\w-]*/gi;
const UPPER_ALPHA_PATTERN = /^[A-Z]+$/;
const UPPER_ROMAN_PATTERN = /^[CDILMVX]+$/;

const countMatches = (selector: string, pattern: RegExp) =>
  selector.match(pattern)?.length ?? 0;

const getSpecificity = (selector: string) =>
  countMatches(selector, SELECTOR_ID_PATTERN) * 10_000 +
  countMatches(selector, SELECTOR_CLASS_PATTERN) * 100 +
  countMatches(selector, SELECTOR_TYPE_PATTERN);

const trimDeclarations = (declarations: string) =>
  declarations.replace(CSS_TRAILING_SEPARATOR_PATTERN, '').trim();

const isPseudoOrNamespaceSelector = (selector: string) =>
  selector.includes(':');

// Pasted CSS can hold a selector this DOM rejects; that rule matches nothing.
const queryAll = (document: Document, selector: string) => {
  try {
    return [...document.querySelectorAll(selector)];
  } catch {
    return [];
  }
};

/**
 * The declarations stay as written, because the browser's CSS parser drops the
 * `mso-*` properties that list detection reads.
 */
const inlineStyleRules = (document: Document) => {
  const styleElements = [...document.querySelectorAll('style')];
  const css = styleElements
    .map((element) => element.textContent ?? '')
    .join('\n')
    .replaceAll(CSS_COMMENT_PATTERN, (_match, quoted?: string) => quoted ?? '')
    .replaceAll(CSS_AT_RULE_PATTERN, '');
  const rulesByElement = new Map<
    Element,
    Array<{ declarations: string; order: number; specificity: number }>
  >();
  let order = 0;

  for (const [, selectorList, block] of css.matchAll(CSS_RULE_PATTERN)) {
    const declarations = trimDeclarations(block);

    if (!declarations) continue;

    for (const part of selectorList.split(',')) {
      const selector = part.trim();

      if (!selector || isPseudoOrNamespaceSelector(selector)) continue;

      const specificity = getSpecificity(selector);

      order += 1;

      for (const element of queryAll(document, selector)) {
        const rules = rulesByElement.get(element) ?? [];

        rules.push({ declarations, order, specificity });
        rulesByElement.set(element, rules);
      }
    }
  }
  for (const element of styleElements) element.remove();
  for (const [element, rules] of rulesByElement) {
    const declarations = rules
      .sort(
        (left, right) =>
          left.specificity - right.specificity || left.order - right.order
      )
      .map((rule) => rule.declarations);
    const inline = trimDeclarations(element.getAttribute('style') ?? '');

    if (inline) declarations.push(inline);
    element.setAttribute('style', declarations.join('; '));
  }
};

const parseAlphaOrdinal = (value: string) =>
  Array.from(value.toLowerCase()).reduce(
    (ordinal, character) =>
      ordinal * 26 + character.charCodeAt(0) - 'a'.charCodeAt(0) + 1,
    0
  );

const parseRomanOrdinal = (value: string) => {
  const values: Record<string, number> = {
    c: 100,
    d: 500,
    i: 1,
    l: 50,
    m: 1000,
    v: 5,
    x: 10,
  };
  const characters = Array.from(value.toLowerCase());

  return characters.reduce((ordinal, character, index) => {
    const current = values[character] ?? 0;
    const next = values[characters[index + 1] ?? ''] ?? 0;

    return ordinal + (current < next ? -current : current);
  }, 0);
};

const parseListOrdinal = (text: string, listStyle: string) => {
  const marker = LIST_MARKER_PATTERN.exec(text)?.[1].split('.').at(-1);

  if (!marker) return undefined;
  if (listStyle.startsWith('decimal')) {
    return DECIMAL_COMPONENT_PATTERN.test(marker) ? Number(marker) : undefined;
  }
  if (listStyle.includes('alpha')) return parseAlphaOrdinal(marker);
  if (listStyle.includes('roman')) return parseRomanOrdinal(marker);

  return undefined;
};

const getListStyleFromDeclaredFormat = (format: string | undefined) => {
  switch (format) {
    case 'alpha-lower': {
      return 'lower-alpha';
    }
    case 'alpha-upper': {
      return 'upper-alpha';
    }
    case 'bullet': {
      return 'disc';
    }
    case 'decimal': {
      return 'decimal';
    }
    case 'decimal-leading-zero': {
      return 'decimal-leading-zero';
    }
    case 'roman-lower': {
      return 'lower-roman';
    }
    case 'roman-upper': {
      return 'upper-roman';
    }
    case undefined: {
      return undefined;
    }
  }

  return undefined;
};

const getDeclaredListStyles = (html: string) => {
  const styles = new Map<string, string>();

  for (const match of html.matchAll(LIST_DECLARATION_PATTERN)) {
    const format = MSO_LEVEL_NUMBER_FORMAT_PATTERN.exec(match[3])?.[1]
      .trim()
      .toLowerCase();
    const style = getListStyleFromDeclaredFormat(format);

    if (style) styles.set(`${match[1]}:${match[2]}`, style);
  }

  return styles;
};

// Excel holds its cell formatting and mso- markers in its style block, so its
// cells carry no inline Word markers until Word paste inlines that block.
const isOfficePayload = (html: string) => {
  const document = parseDocxHtml(html);

  return (
    isWordHtml(document.body) ||
    document
      .querySelector('meta[name="ProgId" i]')
      ?.getAttribute('content')
      ?.startsWith('Excel.') === true
  );
};

const WORD_COMMENT_STYLE_PATTERN =
  /mso-(?:element:\s*comment-list|special-character:\s*comment)/i;

const WORD_LEFT_OUT_PAYLOADS = [
  {
    matches: (element: HTMLElement) => element.style.display === 'none',
    message: 'Word hidden text was left out.',
  },
  {
    matches: (element: HTMLElement) =>
      element.matches('a.msocomanchor, a[href^="#_msocom"]') ||
      WORD_COMMENT_STYLE_PATTERN.test(element.getAttribute('style') ?? ''),
    message: 'Word comments were left out.',
    range: '[if !supportAnnotations]',
  },
  {
    matches: (element: HTMLElement) => element.matches('del, .msoDel'),
    message: 'Word tracked changes were accepted.',
    unwrap: 'ins, .msoIns',
  },
];

const prepareWordHtml = (
  input: string,
  rtf: string,
  markers: EquationMarkers
) => {
  const document = parseDocxHtml(input);

  inlineStyleRules(document);
  const { body } = document;
  const elements = Array.from(body.querySelectorAll<HTMLElement>('*'));
  const comments = getHtmlComments(body);
  const found = WORD_LEFT_OUT_PAYLOADS.map(
    ({ matches, message, range, unwrap }) => ({
      message,
      range: range && comments.includes(range) ? range : undefined,
      removed: matches ? elements.filter(matches) : [],
      unwrapped: unwrap ? Array.from(body.querySelectorAll(unwrap)) : [],
    })
  );
  const leftOut: string[] = [];

  for (const { message, range, removed, unwrapped } of found) {
    for (const element of removed) element.remove();
    for (const element of unwrapped) element.replaceWith(...element.childNodes);
    if (range) removeHtmlNodesBetweenComments(body, range, '[endif]');
    if (removed.length > 0 || unwrapped.length > 0 || range) {
      leftOut.push(message);
    }
  }
  if (markWordEquations(body, markers).unread) {
    leftOut.push('Word equations were left out.');
  }

  const getIndent = (
    element: HTMLElement,
    property: 'marginLeft' | 'textIndent'
  ) => {
    const value = element.style[property];

    if (!value || value.startsWith('-')) return 0;

    let number = value.replace(NON_NUMERIC_PATTERN, '');

    if (number.startsWith('.')) number = `0${number}`;

    const parsed = Number.parseFloat(number);

    if (!parsed) return 0;

    return Math.round(value.includes('in') ? (parsed * 72) / 36 : parsed / 36);
  };
  const orderedStyleBySequence = new Map<string, string>();
  const countByList = new Map<string, { last: number[]; open: boolean[] }>();
  const declaredListStyles = getDeclaredListStyles(input);

  body.querySelectorAll('p, h1, h2, h3, h4, h5, h6').forEach((element) => {
    const htmlElement = element as HTMLElement;
    const style = element.getAttribute('style') ?? '';

    // Firefox's CSS parser drops the mso-list style on copy, while the
    // marker's conditional comment survives.
    if (
      element.outerHTML.includes('<!--[if !supportLists]-->') ||
      (MSO_LIST_PATTERN.test(style) &&
        [...element.querySelectorAll('[style]')].some((child) =>
          MSO_LIST_IGNORE_PATTERN.test(child.getAttribute('style') ?? '')
        ))
    ) {
      const listItem = document.createElement(
        element.tagName === 'P' ? 'li' : element.tagName.toLowerCase()
      );
      const clonedElement = element.cloneNode(true) as Element;

      Array.from(element.attributes).forEach(({ name, value }) => {
        listItem.setAttribute(name, value);
      });
      removeHtmlNodesBetweenComments(
        clonedElement,
        '[if !supportLists]',
        '[endif]'
      );
      traverseHtmlElements(clonedElement, (child) => {
        if (MSO_LIST_IGNORE_PATTERN.test(child.getAttribute('style') ?? '')) {
          child.remove();
        }

        return true;
      });

      const level = LEVEL_PATTERN.exec(style)?.[1];
      const visualIndent = getIndent(htmlElement, 'marginLeft');

      const indent = level
        ? Math.max(Number.parseInt(level, 10), visualIndent)
        : Math.max(1, visualIndent);

      listItem.dataset.indent = String(indent);

      const markerText =
        Array.from(element.querySelectorAll<HTMLElement>('[style]'))
          .find((child) =>
            MSO_LIST_IGNORE_PATTERN.test(child.getAttribute('style') ?? '')
          )
          ?.textContent?.trim() ??
        element.textContent?.trimStart() ??
        '';
      const identity = LIST_IDENTITY_PATTERN.exec(style);
      const declaredListStyle =
        identity?.[1] && level
          ? declaredListStyles.get(`${identity[1]}:${level}`)
          : undefined;
      const marker = LIST_MARKER_PATTERN.exec(markerText)?.[1]
        .split('.')
        .at(-1);
      let listStyle =
        declaredListStyle ??
        (marker && DECIMAL_COMPONENT_PATTERN.test(marker)
          ? marker.length > 1 && marker.startsWith('0')
            ? 'decimal-leading-zero'
            : 'decimal'
          : marker && LOWER_ROMAN_PATTERN.test(marker)
            ? 'lower-roman'
            : marker && LOWER_ALPHA_PATTERN.test(marker)
              ? 'lower-alpha'
              : marker && UPPER_ROMAN_PATTERN.test(marker)
                ? 'upper-roman'
                : marker && UPPER_ALPHA_PATTERN.test(marker)
                  ? 'upper-alpha'
                  : 'disc');
      const sequenceKey = `${identity?.[1] ?? 'list'}:${
        identity?.[2] ?? ''
      }:${indent}`;
      const previousStyle = orderedStyleBySequence.get(sequenceKey);

      if (previousStyle === 'lower-alpha' && listStyle === 'lower-roman') {
        listStyle = 'lower-alpha';
      } else if (
        previousStyle === 'upper-alpha' &&
        listStyle === 'upper-roman'
      ) {
        listStyle = 'upper-alpha';
      }
      if (listStyle !== 'disc') {
        orderedStyleBySequence.set(sequenceKey, listStyle);
      }
      listItem.dataset.listType =
        listStyle === 'disc' ? 'bulleted' : 'numbered';
      if (listStyle !== 'disc' && listStyle !== 'decimal') {
        listItem.dataset.listStyle = listStyle;
      }
      // Each Word list counts on its own across other blocks, as a Plate list
      // does, so only a marker that differs from that count becomes a restart.
      const listId = identity?.[1] ?? 'word';
      const count = countByList.get(listId) ?? { last: [], open: [] };

      countByList.set(listId, count);
      count.open.length = Math.min(count.open.length, indent + 1);
      listItem.dataset.listId = listId;
      if (listStyle !== 'disc') {
        const ordinal = parseListOrdinal(markerText, listStyle);
        const expected = count.open[indent] ? count.last[indent] + 1 : 1;

        if (ordinal !== undefined && ordinal !== expected) {
          listItem.dataset.listRestart = String(ordinal);
        }
        count.last[indent] = ordinal ?? expected;
        count.open[indent] = true;
      }
      listItem.innerHTML = clonedElement.innerHTML;
      element.replaceWith(listItem);

      return;
    }

    const indent = getIndent(htmlElement, 'marginLeft');
    const textIndent = getIndent(htmlElement, 'textIndent');

    if (indent) {
      htmlElement.dataset.indent = String(indent);
    }
    if (textIndent) {
      htmlElement.dataset.textIndent = String(textIndent);
    }
  });

  return { html: cleanWordHtml(body.innerHTML, rtf), leftOut };
};

const cleanWordSlice = (
  slice: ContentSlice,
  tableType: string | undefined,
  tableCellType: string | undefined,
  markers: EquationMarkers,
  equationKinds: Readonly<{ block: boolean; inline: boolean }>
) => {
  const cleanNode = (node: Descendant): Descendant => {
    if (!ElementApi.isElement(node)) return node;

    const children = node.children.map(cleanNode);

    if (tableType && node.type === tableType) {
      const { columnWidths: _columnWidths, ...table } = node;

      return { ...table, children };
    }
    if (tableCellType && node.type === tableCellType) {
      const { borders: _borders, size: _size, ...cell } = node;

      return { ...cell, children };
    }

    return { ...node, children };
  };
  const clean = (nodes: readonly Descendant[]) =>
    materializeEquations(nodes.map(cleanNode), markers, equationKinds);

  return ContentSlice.fromJSON({
    ...slice,
    content: clean(slice.content),
    ...(slice.roots
      ? {
          roots: Object.fromEntries(
            Object.entries(slice.roots).map(([root, children]) => [
              root,
              clean(children),
            ])
          ),
        }
      : {}),
  });
};

/** Normalizes Word clipboard payloads before the installed HTML parser runs. */
export const WordPastePlugin = definePlugin(PLUGINS.wordPaste, {
  dependencies: [HtmlPlugin],
  editOnly: true,
}).extend(() => ({
  dataTransferFormats: [
    {
      accept: ({ data }) => fitsHtmlByteLimit(data) && isOfficePayload(data),
      decode: (context) => {
        const { data, registry, report, snapshot } = context;
        const markers = createEquationMarkers(data);
        const prepared = prepareWordHtml(
          data,
          snapshot.getData('text/rtf'),
          markers
        );
        const slice = decodePreparedHtmlDataTransfer(context, prepared.html);

        const leftSomethingOut = prepared.leftOut.length > 0;

        if (!leftSomethingOut && !slice?.content.length) return null;
        for (const message of prepared.leftOut) {
          report({ impact: 'lossy', message });
        }
        if (!slice) {
          report({
            impact: 'lossy',
            message: 'Word content is too large or too deeply nested to paste.',
          });

          return ContentSlice.empty;
        }

        return cleanWordSlice(
          slice,
          registry.type(PLUGINS.table),
          registry.type(PLUGINS.tableCell),
          markers,
          {
            block: registry.has(PLUGINS.equation),
            inline: registry.has(PLUGINS.inlineEquation),
          }
        );
      },
      mimeType: 'text/html',
      priority: 100,
      scope: 'document',
    },
  ],
}));
