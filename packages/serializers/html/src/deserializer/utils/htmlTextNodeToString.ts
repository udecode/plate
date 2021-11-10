/**
 * Deserialize HTML text node to text.
 */
import { isHtmlText } from './isHtmlText';

// export const htmlTextNewLineToNull = (node: HTMLElement | ChildNode) => {
//   if (isHtmlText(node)) {
//     return node.nodeValue === '\n' && null : node.textContent;
//   }
// };

export const htmlTextNodeToString = (node: HTMLElement | ChildNode) => {
  if (isHtmlText(node)) {
    return node.nodeValue === '\n' ? null : node.textContent;
  }
};
