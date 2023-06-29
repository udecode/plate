import { isHtmlBlockElement } from './isHtmlBlockElement';
import { traverseHtmlElements } from './traverseHtmlElements';

const isTableElement = (element: Element) => {
  const tableRegex = /^(table)$/i;
  return tableRegex.test(element.nodeName);
};

/**
 * Set HTML blocks mark styles to a new child span element if any.
 * This allows Plate to use block marks.
 */
export const copyBlockMarksToSpanChild = (rootNode: Node) => {
  traverseHtmlElements(rootNode, (element) => {
    const el = element as HTMLElement;

    const styleAttribute = element.getAttribute('style');
    if (!styleAttribute) return true;

    if (isHtmlBlockElement(el) && !isTableElement(el)) {
      const {
        style: {
          backgroundColor,
          color,
          fontFamily,
          fontSize,
          fontStyle,
          fontWeight,
          textDecoration,
        },
      } = el;

      if (
        backgroundColor ||
        color ||
        fontFamily ||
        fontSize ||
        fontStyle ||
        fontWeight ||
        textDecoration
      ) {
        const span = document.createElement('span');
        if (!['initial', 'inherit'].includes(color)) {
          span.style.color = color;
        }
        span.style.fontFamily = fontFamily;
        span.style.fontSize = fontSize;
        if (!['normal', 'initial', 'inherit'].includes(color)) {
          span.style.fontStyle = fontStyle;
        }
        if (!['normal', 400].includes(fontWeight)) {
          span.style.fontWeight = fontWeight;
        }
        span.style.textDecoration = textDecoration;

        span.innerHTML = el.innerHTML;
        element.innerHTML = span.outerHTML;
      }
    }
    return true;
  });
};
