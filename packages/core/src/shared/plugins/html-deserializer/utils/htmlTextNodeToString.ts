/** Deserialize HTML text node to text. */
import { isHtmlText } from './isHtmlText';

export const htmlTextNodeToString = (node: ChildNode | HTMLElement) => {
  if (isHtmlText(node)) {
    return node.textContent || '';
  }
};
