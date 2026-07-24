/** Deserialize HTML text node to text. */
import { isHtmlText } from './isHtmlText';

export const htmlTextNodeToString = (node: ChildNode | HTMLElement) => {
  if (isHtmlText(node)) {
    if (node.parentElement?.dataset.platePreventDeserialization) return '';
    if (
      node.textContent === '\uFEFF' &&
      node.parentElement?.hasAttribute('data-plite-string')
    ) {
      return '';
    }

    return node.textContent || '';
  }
};
