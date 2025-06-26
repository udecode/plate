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

/** Check if a BR tag is between two block elements. */
const isBrBetweenBlocks = (node: Element): boolean => {
  if (node.nodeName !== 'BR') return false;

  const prevSibling = node.previousElementSibling;
  const nextSibling = node.nextElementSibling;

  return isBlockElement(prevSibling) && isBlockElement(nextSibling);
};

/** Deserialize HTML element or child node. */
export const deserializeHtmlNode =
  (editor: SlateEditor) =>
  (node: ChildNode | HTMLElement): DeserializeHtmlNodeReturnType => {
    const textNode = htmlTextNodeToString(node);

    if (textNode) return textNode;
    if (!isHtmlElement(node)) return null;

    // Convert BR tags between block elements to empty paragraphs (e.g., from Google Docs)
    if (isBrBetweenBlocks(node)) {
      return {
        children: [{ text: '' }],
        type: editor.getType('p'),
      };
    }

    // Skip Apple-interchange-newline BR tags
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
