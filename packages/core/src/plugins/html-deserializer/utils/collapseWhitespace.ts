import { isHtmlElement } from './isHtmlElement';
import { isHtmlText } from './isHtmlText';

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
}

const collapseWhiteSpaceChildren = (node: Node, state: CollapseWhiteSpaceState) => {
  const childNodes = Array.from(node.childNodes);

  for (const childNode of childNodes) {
    collapseWhiteSpaceNode(childNode, state);
  }
};

const collapseWhiteSpaceElement = (element: HTMLElement, state: CollapseWhiteSpaceState) => {
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
    ) return 'all';

    return 'collapse';
  })();

  const trimEnd: TrimEndRule = {
    normal: 'collapse' as const,
    'actual-pre': 'single-newline' as const,
    pre: 'single-newline' as const,
    'pre-line': 'single-newline' as const,
  }[whiteSpaceRule];

  const collapseWhiteSpace: boolean = {
    normal: true,
    'actual-pre': false,
    pre: false,
    'pre-line': true,
  }[whiteSpaceRule];

  const whiteSpaceIncludesNewlines = whiteSpaceRule !== 'pre-line';

  const collapsedTextContent = collapseString(textContent || '', {
    trimStart,
    trimEnd,
    collapseWhiteSpace,
    whiteSpaceIncludesNewlines,
  });

  if (state.inlineFormattingContext && collapseWhiteSpace) {
    state.inlineFormattingContext.lastHasTrailingWhiteSpace = collapsedTextContent.endsWith(' ');
  }

  text.textContent = collapsedTextContent;
};

// Utilities
const collapseString = (text: string, {
  trimStart = 'collapse',
  trimEnd = 'collapse',
  collapseWhiteSpace = true,
  whiteSpaceIncludesNewlines = true,
}: {
  trimStart?: TrimStartRule;
  trimEnd?: TrimEndRule;
  collapseWhiteSpace?: boolean;
  whiteSpaceIncludesNewlines?: boolean;
} = {}) => {
  if (trimStart === 'all') {
    text = text.replace(/^\s+/, '');
  }

  if (trimEnd === 'single-newline') {
    // Strip at most one newline from the end
    text = text.replace(/\n$/, '');
  }

  if (collapseWhiteSpace) {
    const whiteSpaceRegex = whiteSpaceIncludesNewlines ? /\s+/g : /[^\S\r\n]+/g;
    text = text.replace(whiteSpaceRegex, ' ');
  }

  return text;
};

const isHtmlInlineElement = (element: HTMLElement) => {
  // TODO: Proper implementation
  const inlineTags = ['SPAN', 'A', 'B', 'I', 'EM', 'STRONG', 'S', 'U', 'CODE'];
  return inlineTags.includes(element.tagName);
};

const inferWhiteSpaceRule = (element: HTMLElement): WhiteSpaceRule | null => {
  const whiteSpaceProperty = element.style.whiteSpace;

  switch (whiteSpaceProperty) {
    case 'normal':
    case 'nowrap':
      return 'normal';
    case 'pre':
    case 'pre-wrap':
    case 'break-spaces':
      return 'pre';
    case 'pre-line':
      return 'pre-line';
  }

  if (element.tagName === 'PRE') {
    return 'actual-pre';
  }

  if (whiteSpaceProperty === 'initial') {
    return 'normal';
  }

  return null;
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
