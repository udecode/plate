/**
 * Deserialize HTML text node to text.
 */
import { isHtmlText } from './isHtmlText';

export const htmlTextNodeToString = (node: HTMLElement | ChildNode) => {
  if (isHtmlText(node)) {
    return node.textContent || '';
  }
};
