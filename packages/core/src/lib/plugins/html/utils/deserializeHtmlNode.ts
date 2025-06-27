import type { SlateEditor } from '../../../editor';
import type { DeserializeHtmlNodeReturnType } from '../types';

import { isSlateNode } from '../../../static';
import { htmlBodyToFragment } from './htmlBodyToFragment';
import { htmlBrToNewLine } from './htmlBrToNewLine';
import { htmlElementToElement } from './htmlElementToElement';
import { htmlElementToLeaf } from './htmlElementToLeaf';
import { htmlTextNodeToString } from './htmlTextNodeToString';
import { inlineTagNames } from './inlineTagNames';
import { isHtmlElement } from './isHtmlElement';

/** Check if an element is a block-level element. */
const isBlockElement = (element: Element | null): boolean => {
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

  // Check if BR has text node siblings
  const hasTextSiblings = () => {
    let sibling: Node | null = node.previousSibling;
    
    while (sibling) {
      if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
        return true;
      }
      sibling = sibling.previousSibling;
    }
    
    sibling = node.nextSibling;
    while (sibling) {
      if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
        return true;
      }
      sibling = sibling.nextSibling;
    }
    
    return false;
  };

  // If BR has text siblings, it should be a newline
  if (hasTextSiblings()) {
    return false;
  }

  // Check if BR is within inline content
  const parent = node.parentElement;
  if (!parent) return false;

  // If parent is a paragraph or other text container, BR should be a newline
  if (
    parent.tagName === 'P' ||
    parent.tagName === 'SPAN' ||
    inlineTagNames.has(parent.tagName)
  ) {
    return false;
  }

  // BR tags without text siblings and in block context should become empty paragraphs
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
