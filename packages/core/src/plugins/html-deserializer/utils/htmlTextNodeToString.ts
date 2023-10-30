/**
 * Deserialize HTML text node to text.
 */
import { isHtmlText } from './isHtmlText';

function findParentElementWithWhiteSpace(
  node: HTMLElement | ChildNode
): HTMLElement | null {
  let parentNode = node.parentNode as HTMLElement;

  while (parentNode != null) {
    if (parentNode.nodeType === Node.ELEMENT_NODE) {
      const style = parentNode.style;

      // The <pre> default style is "white-space: pre;"
      if (parentNode.nodeName === 'PRE') return parentNode;

      if (style.whiteSpace && style.whiteSpace !== 'inherit') {
        return parentNode;
      }
    }

    parentNode = parentNode.parentNode as HTMLElement;
  }

  return node.parentNode as HTMLElement;
}

// https://github.com/udecode/plate/pull/2718#discussion_r1375418430
// Strip exactly one \n from the end of the text node
const stripOneNewlineFromEnd = (str = '') => str.replaceAll(/(?<!\n)\n$/g, '');

// Strip exactly one \n from the start of the text node
const stripOneNewlineFromStart = (str = '') => str.replaceAll(/^\n(?!\n)/g, '');

const mergeWhitespace = (node: HTMLElement | ChildNode) => {
  const parentNode = findParentElementWithWhiteSpace(node);
  if (!parentNode) return;

  let parentWhiteSpace = parentNode.style.whiteSpace;

  // The <pre> default style is "white-space: pre;"
  if (parentNode.nodeName === 'PRE') {
    // For white-space: pre or pre-line:
    // Strip exactly one \n from the start of the text node
    // Strip exactly one \n from the end of the text node
    node.textContent =
      node.textContent &&
      stripOneNewlineFromStart(stripOneNewlineFromEnd(node.textContent));
    return;
  }

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
    // For white-space: pre or pre-line:
    // Do not strip any \n from the start of the text node
    // Strip exactly one \n from the end of the text node
    case 'pre-line': {
      node.textContent =
        node.textContent &&
        stripOneNewlineFromEnd(node.textContent.replaceAll(/[\t ]+/g, ' '));
      break;
    }
    case 'pre': {
      node.textContent =
        node.textContent && stripOneNewlineFromEnd(node.textContent);
      break;
    }
    // eslint-disable-next-line unicorn/no-useless-switch-case
    case 'break-spaces':
    // eslint-disable-next-line unicorn/no-useless-switch-case
    case 'pre-wrap':
    // eslint-disable-next-line unicorn/no-useless-switch-case
    case 'revert': // "revert" and "revert-layer" are expected to be supported in the future.
    // eslint-disable-next-line unicorn/no-useless-switch-case
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
