/**
 * Deserialize HTML text node to text.
 */
import { isHtmlText } from './isHtmlText';

export const htmlTextNodeToString = (node: HTMLElement | ChildNode) => {
  if (isHtmlText(node)) {
    const trimmedText = node.textContent ?? '';
    return trimmedText.length > 0 ? trimmedText : null;
  }
};
