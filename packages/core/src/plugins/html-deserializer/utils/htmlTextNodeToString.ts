/**
 * Deserialize HTML text node to text.
 */
import { isHtmlText } from './isHtmlText';
import { getStripWhitespace } from './stripWhitespaceConfig';

function getStyleFromNode(node: HTMLElement | ChildNode): string {
  if (!(node as HTMLElement).getAttribute) return '';

  const styleAttr = (node as HTMLElement).getAttribute('style');

  return styleAttr ? styleAttr.trim() : '';
}

// Can use the npm package style-to-object.
// https://www.npmjs.com/package/style-to-object
function styleToObject(styleText: string): Record<string, string> {
  const styleObject = {};
  const declarations = styleText.split(';');

  const camelCase = (str: string) => {
    return str.replaceAll(/-([a-z])/g, (match: string, letter: string) => {
      return letter.toUpperCase();
    });
  };

  declarations.forEach((declaration) => {
    declaration = declaration.trim();
    if (declaration) {
      const [property, value] = declaration.split(':');
      const propertyName = camelCase(property.trim());
      // @ts-ignore
      styleObject[propertyName] = value.trim();
    }
  });

  return styleObject;
}

function findParentElementWhiteSpace(node: HTMLElement | ChildNode) {
  let parentNode = node.parentNode;
  // Both `node.style` and `getComputedStyle` always return an empty value.
  while (parentNode != null) {

    // The <pre> default style is "white-space: pre;"
    if (parentNode.nodeName === 'PRE') return 'pre';

    if (parentNode.nodeType === Node.ELEMENT_NODE) {
      const styleStr = getStyleFromNode(parentNode as typeof node);
      const styles = styleStr ? styleToObject(styleStr) : {};

      if (styles['whiteSpace'] && styles['whiteSpace'] !== 'inherit') {
        return styles['whiteSpace'];
      }
    }

    parentNode = parentNode.parentNode;
  }

  return '';
}

const mergeWhitespace = (node: HTMLElement | ChildNode) => {
  let parentWhiteSpace = findParentElementWhiteSpace(node);

  if (!parentWhiteSpace) {
    parentWhiteSpace = 'normal';
  }

  switch (parentWhiteSpace) {
    case 'unset':
    case 'initial': // Browser's default styles.
    case 'normal':
    case 'nowrap': {
      node.textContent =
        node.textContent && node.textContent.trim().replaceAll(/\s+/g, ' ');
      break;
    }
    case 'pre-line': {
      node.textContent =
        node.textContent && node.textContent.replaceAll(/[\t ]+/g, ' ');
      break;
    }
    case 'pre':
    case 'break-spaces':
    case 'pre-wrap':
    case 'revert': // "revert" and "revert-layer" are expected to be supported in the future.
    case 'revert-layer':
    default: {
      break;
    }
  }
};

export const htmlTextNodeToString = (
  node: HTMLElement | ChildNode,
  stripWhitespace = true
) => {
  if (isHtmlText(node)) {

    if (stripWhitespace) {
      mergeWhitespace(node);
    } else {
      node.textContent = node.textContent?.replace(/^\n+|\n+$/g, '') ?? '';
    }

    const trimmedText = node.textContent ?? '';
    return trimmedText.length > 0 ? trimmedText : null;
  }
};
