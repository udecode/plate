import { isHtmlElement } from './isHtmlElement';
import { isHtmlText } from './isHtmlText';

/**
 * # Methodology: Standard Inline Elements
 *
 * ## Step 1. Get the list of all standard tag names
 *
 * Go to https://developer.mozilla.org/en-US/docs/Web/HTML/Element and run the
 * following in the console to generate a JSON array of tag names:
 *
 * ```js
 * JSON.stringify(
 *   Array.from(document.querySelectorAll('article table td:first-child')).map((td) => {
 *     const body = document.createElement('body');
 *     body.innerHTML = td.textContent;
 *     return body.firstChild?.tagName;
 *   }).filter((tagName) => tagName)
 * );
 * ```
 *
 * Output (as of 2023-11-06):
 *
 * ```json
 * '["BASE","LINK","META","STYLE","TITLE","ADDRESS","ARTICLE","ASIDE","FOOTER","HEADER","H1","HGROUP","MAIN","NAV","SECTION","SEARCH","BLOCKQUOTE","DD","DIV","DL","DT","FIGCAPTION","FIGURE","HR","LI","MENU","OL","P","PRE","UL","A","ABBR","B","BDI","BDO","BR","CITE","CODE","DATA","DFN","EM","I","KBD","MARK","Q","RP","RT","RUBY","S","SAMP","SMALL","SPAN","STRONG","SUB","SUP","TIME","U","VAR","WBR","AREA","AUDIO","IMG","MAP","TRACK","VIDEO","EMBED","IFRAME","OBJECT","PICTURE","PORTAL","SOURCE","svg","math","CANVAS","NOSCRIPT","SCRIPT","DEL","INS","TABLE","BUTTON","DATALIST","FIELDSET","FORM","INPUT","LABEL","LEGEND","METER","OPTGROUP","OPTION","OUTPUT","PROGRESS","SELECT","TEXTAREA","DETAILS","DIALOG","SUMMARY","SLOT","TEMPLATE","ACRONYM","BIG","CENTER","CONTENT","DIR","FONT","IMG","MARQUEE","MENUITEM","NOBR","NOEMBED","NOFRAMES","PARAM","PLAINTEXT","RB","RTC","SHADOW","STRIKE","TT","XMP"]'
 * ```
 *
 * ## Step 2. For each tag name, determine the default browser style
 *
 * Open an empty HTML file in the browser and run the following in the console:
 *
 * ```js
 * const tagNames = JSON.parse(<JSON string from step 1>);
 *
 * JSON.stringify(
 *   tagNames.filter((tagName) => {
 *     const element = document.createElement(tagName);
 *     document.body.appendChild(element);
 *     const display = window.getComputedStyle(element).display;
 *     element.remove();
 *     return display.startsWith('inline');
 *   })
 * );
 * ```
 *
 * Place the result in the array below (accurate as of 2023-11-06).
 */
const inlineTags = new Set([
  'A',
  'ABBR',
  'B',
  'BDI',
  'BDO',
  'BR',
  'CITE',
  'CODE',
  'DATA',
  'DFN',
  'EM',
  'I',
  'KBD',
  'MARK',
  'Q',
  'S',
  'SAMP',
  'SMALL',
  'SPAN',
  'STRONG',
  'SUB',
  'SUP',
  'TIME',
  'U',
  'VAR',
  'WBR',
  'IMG',
  'MAP',
  'TRACK',
  'VIDEO',
  'EMBED',
  'IFRAME',
  'OBJECT',
  'PICTURE',
  'PORTAL',
  'SOURCE',
  'svg',
  'math',
  'CANVAS',
  'DEL',
  'INS',
  'BUTTON',
  'INPUT',
  'LABEL',
  'METER',
  'OUTPUT',
  'PROGRESS',
  'SELECT',
  'TEXTAREA',
  'ACRONYM',
  'BIG',
  'CONTENT',
  'FONT',
  'IMG',
  'MARQUEE',
  'MENUITEM',
  'NOBR',
  'SHADOW',
  'STRIKE',
  'TT',
]);

/**
 * Actual <pre> elements are treated differently, so track these as a separate
 * rule.
 */
type WhiteSpaceRule = 'normal' | 'actual-pre' | 'pre' | 'pre-line';

type TrimStartRule = 'collapse' | 'all';
type TrimEndRule = 'collapse' | 'single-newline';

type CollapseWhiteSpaceState = {
  inlineFormattingContext: null | {
    atStart: boolean;
    lastHasTrailingWhiteSpace: boolean;
  };

  whiteSpaceRule: WhiteSpaceRule;
};

// Entrypoint
export const collapseWhiteSpace = (element: HTMLElement) => {
  const clonedElement = element.cloneNode(true) as HTMLElement;

  // Mutable state object
  const state: CollapseWhiteSpaceState = {
    inlineFormattingContext: null,
    whiteSpaceRule: 'normal',
  };

  collapseWhiteSpaceElement(clonedElement, state);

  return clonedElement;
};

// Recursive functions
const collapseWhiteSpaceNode = (node: Node, state: CollapseWhiteSpaceState) => {
  if (isHtmlElement(node)) {
    collapseWhiteSpaceElement(node as HTMLElement, state);
    return;
  }

  if (isHtmlText(node)) {
    collapseWhiteSpaceText(node as Text, state);
    return;
  }

  collapseWhiteSpaceChildren(node, state);
};

const collapseWhiteSpaceChildren = (
  node: Node,
  state: CollapseWhiteSpaceState
) => {
  const childNodes = Array.from(node.childNodes);

  for (const childNode of childNodes) {
    collapseWhiteSpaceNode(childNode, state);
  }
};

const collapseWhiteSpaceElement = (
  element: HTMLElement,
  state: CollapseWhiteSpaceState
) => {
  const isInlineElement = isHtmlInlineElement(element);
  const previousWhiteSpaceRule = state.whiteSpaceRule;
  const inferredWhiteSpaceRule = inferWhiteSpaceRule(element);

  if (inferredWhiteSpaceRule) {
    state.whiteSpaceRule = inferredWhiteSpaceRule;
  }

  /**
   * Note: We do not want to start an inline formatting context until we
   * encounter a text node.
   */

  // End any existing inline formatting context
  if (!isInlineElement) {
    endInlineFormattingContext(state);
  }

  collapseWhiteSpaceChildren(element, state);

  // Do not let inline formatting context break out of block elements
  if (!isInlineElement) {
    endInlineFormattingContext(state);
  }

  // Restore previous whiteSpaceRule
  state.whiteSpaceRule = previousWhiteSpaceRule;
};

const collapseWhiteSpaceText = (text: Text, state: CollapseWhiteSpaceState) => {
  const textContent = text.textContent || '';
  const isWhiteSpaceOnly = textContent.trim() === '';

  // Do not start an inline formatting context with a whiteSpace-only text node
  if (state.inlineFormattingContext || !isWhiteSpaceOnly) {
    upsertInlineFormattingContext(state);
  }

  const { whiteSpaceRule } = state;

  /**
   * Note: Due to the way HTML strings are parsed in htmlStringToDOMNode, up to
   * one newline is already trimmed from the start of text nodes inside <pre>
   * elements. If we do so again here, we may remove too many newlines. This
   * only applies to actual <pre> elements, not elements with the white-space
   * CSS property.
   */
  const trimStart: TrimStartRule = (() => {
    if (whiteSpaceRule !== 'normal') return 'collapse';

    if (
      !state.inlineFormattingContext ||
      state.inlineFormattingContext.atStart ||
      state.inlineFormattingContext.lastHasTrailingWhiteSpace
    )
      return 'all';

    return 'collapse';
  })();

  const trimEnd: TrimEndRule = {
    normal: 'collapse' as const,
    'actual-pre': 'single-newline' as const,
    pre: 'single-newline' as const,
    'pre-line': 'single-newline' as const,
  }[whiteSpaceRule];

  const shouldCollapseWhiteSpace: boolean = {
    normal: true,
    'actual-pre': false,
    pre: false,
    'pre-line': true,
  }[whiteSpaceRule];

  const whiteSpaceIncludesNewlines = whiteSpaceRule !== 'pre-line';

  const collapsedTextContent = collapseString(textContent || '', {
    trimStart,
    trimEnd,
    shouldCollapseWhiteSpace,
    whiteSpaceIncludesNewlines,
  });

  if (state.inlineFormattingContext && shouldCollapseWhiteSpace) {
    state.inlineFormattingContext.lastHasTrailingWhiteSpace =
      collapsedTextContent.endsWith(' ');
  }

  text.textContent = collapsedTextContent;
};

// Utilities
const collapseString = (
  text: string,
  {
    trimStart = 'collapse',
    trimEnd = 'collapse',
    shouldCollapseWhiteSpace = true,
    whiteSpaceIncludesNewlines = true,
  }: {
    trimStart?: TrimStartRule;
    trimEnd?: TrimEndRule;
    shouldCollapseWhiteSpace?: boolean;
    whiteSpaceIncludesNewlines?: boolean;
  } = {}
) => {
  if (trimStart === 'all') {
    text = text.replace(/^\s+/, '');
  }

  if (trimEnd === 'single-newline') {
    // Strip at most one newline from the end
    text = text.replace(/\n$/, '');
  }

  if (shouldCollapseWhiteSpace) {
    if (whiteSpaceIncludesNewlines) {
      text = text.replaceAll(/\s+/g, ' ');
    } else {
      // Collapse horizontal whitespace
      text = text.replaceAll(/[^\S\n\r]+/g, ' ');

      /**
       * Trim horizontal whitespace from the start and end of lines (behavior
       * of pre-line).
       */
      text = text.replaceAll(/^[^\S\n\r]+/gm, '');
      text = text.replaceAll(/[^\S\n\r]+$/gm, '');
    }
  }

  return text;
};

const inferWhiteSpaceRule = (element: HTMLElement): WhiteSpaceRule | null => {
  const whiteSpaceProperty = element.style.whiteSpace;

  switch (whiteSpaceProperty) {
    case 'normal':
    case 'nowrap': {
      return 'normal';
    }
    case 'pre':
    case 'pre-wrap':
    case 'break-spaces': {
      return 'pre';
    }
    case 'pre-line': {
      return 'pre-line';
    }
  }

  if (element.tagName === 'PRE') {
    return 'actual-pre';
  }

  if (whiteSpaceProperty === 'initial') {
    return 'normal';
  }

  return null;
};

const isHtmlInlineElement = (element: HTMLElement): boolean => {
  const tagNameIsInline = inlineTags.has(element.tagName);

  /**
   * Valid display values include 'inline flow'. We only care about the first
   * part.
   */
  const displayProperty = element.style.display.split(' ')[0];

  if (displayProperty === '') {
    return tagNameIsInline;
  }

  if (displayProperty.startsWith('inline')) {
    return true;
  }

  if (displayProperty === 'inherit' && element.parentElement) {
    return isHtmlInlineElement(element.parentElement);
  }

  /**
   * Handle all special values manually, so that any unhandled values can be
   * assumed to be block.
   *
   * Note: Ideally, content inside `display: none` elements should not be
   * parsed. However, if such elements are parsed, it's best for their inline
   * or block status to be left unchanged.
   */
  if (
    ['initial', 'unset', 'revert', 'revert-layer', 'contents', 'none'].includes(
      displayProperty
    )
  ) {
    return tagNameIsInline;
  }

  return false;
};

// State transforms
const upsertInlineFormattingContext = (state: CollapseWhiteSpaceState) => {
  if (state.inlineFormattingContext) {
    state.inlineFormattingContext.atStart = false;
  } else {
    state.inlineFormattingContext = {
      atStart: true,
      lastHasTrailingWhiteSpace: false,
    };
  }
};

const endInlineFormattingContext = (state: CollapseWhiteSpaceState) => {
  state.inlineFormattingContext = null;
};
