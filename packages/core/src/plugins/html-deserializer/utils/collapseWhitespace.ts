import { isHtmlElement } from './isHtmlElement';
import {isHtmlText} from './isHtmlText';

const isHtmlInlineElement = (element: HTMLElement) => {
  // TODO: Proper implementation
  const inlineTags = ['SPAN', 'A', 'B', 'I', 'EM', 'STRONG', 'S', 'U', 'CODE'];
  return inlineTags.includes(element.tagName);
};

type CollapseWhitespaceState = {
  inlineFormattingContext: null | {
    atStart: boolean;
    lastHasTrailingWhitespace: boolean;
  };
};

// State transforms
const upsertInlineFormattingContext = (state: CollapseWhitespaceState) => {
  if (state.inlineFormattingContext) {
    state.inlineFormattingContext.atStart = false;
  } else {
    state.inlineFormattingContext = {
      atStart: true,
      lastHasTrailingWhitespace: false,
    };
  }
};

const endInlineFormattingContext = (state: CollapseWhitespaceState) => {
  state.inlineFormattingContext = null;
};

// Entrypoint
export const collapseWhitespace = (element: HTMLElement) => {
  const clonedElement = element.cloneNode(true) as HTMLElement;

  // Mutable state object
  const state: CollapseWhitespaceState = {
    inlineFormattingContext: null,
  };

  collapseWhitespaceElement(clonedElement, state);

  return clonedElement;
};

// Recursive functions
const collapseWhitespaceNode = (node: Node, state: CollapseWhitespaceState) => {
  if (isHtmlElement(node)) {
    collapseWhitespaceElement(node as HTMLElement, state);
    return;
  }

  if (isHtmlText(node)) {
    collapseWhitespaceText(node as Text, state);
    return;
  }
     
  collapseWhitespaceChildren(node, state);
}

const collapseWhitespaceChildren = (node: Node, state: CollapseWhitespaceState) => {
  const childNodes = Array.from(node.childNodes);

  for (const childNode of childNodes) {
    collapseWhitespaceNode(childNode, state);
  }
};

const collapseWhitespaceElement = (element: HTMLElement, state: CollapseWhitespaceState) => {
  const isInlineElement = isHtmlInlineElement(element);

  /**
   * Note: We do not want to start an inline formatting context until we
   * encounter a text node.
   */

  // End any existing inline formatting context
  if (!isInlineElement) {
    endInlineFormattingContext(state);
  }

  collapseWhitespaceChildren(element, state);

  // Do not let inline formatting context break out of block elements
  if (!isInlineElement) {
    endInlineFormattingContext(state);
  }
};

const collapseWhitespaceText = (text: Text, state: CollapseWhitespaceState) => {
  const textContent = text.textContent || '';
  const isWhitespaceOnly = textContent.trim() === '';

  // Do not start an inline formatting context with a whitespace-only text node
  if (state.inlineFormattingContext || !isWhitespaceOnly) {
    upsertInlineFormattingContext(state);
  }

  const collapsedTextContent = collapseString(textContent || '', {
    trimStart: state.inlineFormattingContext?.atStart || state.inlineFormattingContext?.lastHasTrailingWhitespace,
  });

  if (state.inlineFormattingContext && collapsedTextContent.endsWith(' ')) {
    state.inlineFormattingContext.lastHasTrailingWhitespace = true;
  }

  text.textContent = collapsedTextContent;
};

// Utilities
const collapseString = (text: string, {
  trimStart = true,
  trimEnd = false,
}: {
  trimStart?: boolean;
  trimEnd?: boolean;
} = {}) => {
  if (trimStart) {
    text = text.replace(/^\s+/g, '');
  }

  if (trimEnd) {
    text = text.replace(/\s+$/g, '');
  }

  text = text.replace(/\s+/g, ' ');

  return text;
};
