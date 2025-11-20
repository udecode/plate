import type { SlateEditor } from '../../../editor';
import type { DeserializeHtmlNodeReturnType } from '../types';

import { isSlateNode } from '../../../utils';
import { htmlBodyToFragment } from './htmlBodyToFragment';
import { htmlBrToNewLine } from './htmlBrToNewLine';
import { htmlElementToElement } from './htmlElementToElement';
import { htmlElementToLeaf } from './htmlElementToLeaf';
import { htmlTextNodeToString } from './htmlTextNodeToString';
import { inlineTagNames } from './inlineTagNames';
import { isHtmlElement } from './isHtmlElement';

/** Check if an element is a block-level element. */
const _isBlockElement = (element: Element | null): boolean => {
  if (!element) return false;

  return !inlineTagNames.has(element.tagName);
};

/** Check if a BR tag should be converted to an empty paragraph. */
const shouldBrBecomeEmptyParagraph = (node: Element): boolean => {
  if (node.nodeName !== 'BR') return false;

  // Skip Apple-interchange-newline BR tags
  if ((node as HTMLBRElement).className === 'Apple-interchange-newline') {
    return false;
  }

  const parent = node.parentElement;
  if (!parent) return false;

  // Check immediate parent for text-containing elements
  // BR tags inside P or SPAN should remain as line breaks
  if (parent.tagName === 'P' || parent.tagName === 'SPAN') {
    return false;
  }

  // Check if BR has adjacent text content at the same DOM level
  const hasAdjacentText = () => {
    // Check previous siblings for direct text nodes only
    let sibling: Node | null = node.previousSibling;
    while (sibling) {
      if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
        return true;
      }
      // Don't check element content, only direct text nodes
      sibling = sibling.previousSibling;
    }

    // Check next siblings for direct text nodes only
    sibling = node.nextSibling;
    while (sibling) {
      if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
        return true;
      }
      // Don't check element content, only direct text nodes
      sibling = sibling.nextSibling;
    }

    return false;
  };

  // If BR has adjacent text, it should be a line break
  if (hasAdjacentText()) {
    return false;
  }

  // For Google Docs: standalone BR tags inside structural elements (B, TD, DIV, etc.)
  // should become empty paragraphs
  return true;
};

/** Deserialize HTML element or child node. */
export const deserializeHtmlNode =
  (editor: SlateEditor) =>
  (node: ChildNode | HTMLElement): DeserializeHtmlNodeReturnType => {
    const textNode = htmlTextNodeToString(node);

    if (textNode) return textNode;
    if (!isHtmlElement(node)) return null;

    // Convert BR tags to empty paragraphs when appropriate (e.g., from Google Docs)
    if (shouldBrBecomeEmptyParagraph(node)) {
      return {
        children: [{ text: '' }],
        type: editor.getType('p'),
      };
    }

    // Skip Apple-interchange-newline BR tags (already handled in shouldBrBecomeEmptyParagraph)
    if (
      node.nodeName === 'BR' &&
      (node as HTMLBRElement).className === 'Apple-interchange-newline'
    ) {
      return null;
    }

    // break line
    const breakLine = htmlBrToNewLine(node);

    if (breakLine) return breakLine;

    // body
    const fragment = htmlBodyToFragment(editor, node as HTMLElement);

    if (fragment) return fragment;

    // element
    const element = htmlElementToElement(
      editor,
      node as HTMLElement,
      isSlateNode(node as HTMLElement)
    );

    if (element) return element;

    // leaf
    return htmlElementToLeaf(editor, node as HTMLElement);
  };
