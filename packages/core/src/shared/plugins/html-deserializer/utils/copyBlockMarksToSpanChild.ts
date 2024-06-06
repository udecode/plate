import { isHtmlBlockElement } from './isHtmlBlockElement';
import { isHtmlTable } from './isHtmlTable';
import { traverseHtmlElements } from './traverseHtmlElements';

/**
 * Set HTML blocks mark styles to a new child span element if any. This allows
 * Plate to use block marks.
 */
export const copyBlockMarksToSpanChild = (rootNode: Node) => {
  traverseHtmlElements(rootNode, (element) => {
    const el = element as HTMLElement;

    const styleAttribute = element.getAttribute('style');

    if (!styleAttribute) return true;
    if (isHtmlBlockElement(el) && !isHtmlTable(el)) {
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

        if (!['inherit', 'initial'].includes(color)) {
          span.style.color = color;
        }

        span.style.fontFamily = fontFamily;
        span.style.fontSize = fontSize;

        if (!['inherit', 'initial', 'normal'].includes(color)) {
          span.style.fontStyle = fontStyle;
        }
        if (![400, 'normal'].includes(fontWeight)) {
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
