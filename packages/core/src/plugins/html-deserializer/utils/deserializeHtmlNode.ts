import { PlateEditor } from '../../../types/PlateEditor';
import {
  DeserializeHtmlChildren,
  DeserializeHtmlNodeReturnType,
} from '../types';
import { htmlBodyToFragment } from './htmlBodyToFragment';
import { htmlBrToNewLine } from './htmlBrToNewLine';
import { htmlElementToElement } from './htmlElementToElement';
import { htmlElementToLeaf } from './htmlElementToLeaf';
import { htmlTextNodeToString } from './htmlTextNodeToString';
import { isHtmlElement } from './isHtmlElement';

/**
 * Deserialize HTML element or child node.
 */
export const deserializeHtmlNode = <T = {}>(editor: PlateEditor<T>) => (
  node: HTMLElement | ChildNode
): DeserializeHtmlNodeReturnType => {
  const textNode = htmlTextNodeToString(node);
  if (textNode) return textNode;

  if (!isHtmlElement(node)) return null;

  // break line
  const breakLine = htmlBrToNewLine(node);
  if (breakLine) return breakLine;

  const children: DeserializeHtmlChildren[] = Array.from(node.childNodes)
    .map(deserializeHtmlNode(editor))
    .flat();

  // body
  const fragment = htmlBodyToFragment({
    element: node,
    children,
  });
  if (fragment) return fragment;

  // element
  const element = htmlElementToElement(editor, {
    element: node,
    children,
  });
  if (element) return element;

  // leaf
  return htmlElementToLeaf(editor, {
    element: node,
    children,
  });
};
