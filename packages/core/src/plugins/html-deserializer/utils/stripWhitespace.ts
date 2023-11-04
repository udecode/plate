import { isHtmlText } from './isHtmlText';

const allWhiteSpaceRegExp = /[\t\n\r ]+/g;
const startWhiteSpaceRegExp = /^[\t\n\r ]+/;
const endWhiteSpaceRegExp = /[\t\n\r ]+$/;

// https://github.com/udecode/plate/pull/2718#discussion_r1375418430
// Strip exactly one \n from the start of the text node
const oneLineFromStartRegExp = /^\n(?!\n)/g;
// Strip exactly one \n from the end of the text node
const oneLineFromEndRegExp = /(?<!\n)\n$/g;

const preElements = new Set([
  'pre',
  'script',
  'noscript',
  'style',
  'textarea',
  'video',
  'audio',
  'iframe',
  'object',
  'code',
]);
const textInLineElements = new Set([
  'span',
  'strong',
  'b',
  'em',
  'i',
  'font',
  's',
  'strike',
  'u',
  'var',
  'cite',
  'dfn',
  'code',
  'mark',
  'q',
  'sup',
  'sub',
  'samp',
]);

const getNodeName = (node: Node) => node.nodeName?.toLowerCase();

const setNodeText = (
  node: Node,
  callback: ((val: string) => string) | string
) => {
  if (node.textContent) {
    node.textContent =
      typeof callback === 'function' ? callback(node.textContent) : callback;
  }
};

const isPreElements = (node: Node) => preElements.has(getNodeName(node));

const isTextInLineElements = (node: Node) =>
  textInLineElements.has(getNodeName(node));

const walk = (node: Node) => {
  if (node.firstChild) {
    return node.firstChild;
  }

  let nodeNext = node.nextSibling;
  if (nodeNext) {
    return nodeNext;
  }

  for (
    let parent = node.parentNode;
    Boolean(parent);
    parent = parent?.parentNode || null
  ) {
    nodeNext = parent?.nextSibling || null;

    if (nodeNext) {
      return nodeNext;
    }
  }
};

const getWhitespaceParent = (node: HTMLElement): [boolean, string, string] => {
  let tempNode = node.parentNode;
  while (tempNode != null) {
    const nodeName = tempNode.nodeName?.toLowerCase();

    if (tempNode.nodeType === Node.ELEMENT_NODE) {
      const style = (tempNode as HTMLElement).style;

      if (style.whiteSpace && style.whiteSpace !== 'inherit') {
        return [true, style.whiteSpace, nodeName];
      }
    }

    if (isPreElements(tempNode)) {
      return [true, '', nodeName];
    } else {
      tempNode = tempNode.parentNode;
    }
  }
  return [false, '', ''];
};

function nextSiblingWithSpace(node: Node) {
  if (node.parentNode == null) {
    return true;
  }

  if (!textInLineElements.has(getNodeName(node.parentNode))) {
    return true;
  }

  if (node.parentNode.nextSibling == null) {
    return true;
  }

  if (node.parentNode.nextSibling.nodeType === Node.TEXT_NODE) {
    return false;
  }

  if (isTextInLineElements(node.parentNode.nextSibling)) {
    return false;
  }

  return true;
}

function stripWhitespaceNormal(
  node: HTMLElement,
  preNodeEndsWithSpace: boolean
) {
  let text = node.textContent ?? '';
  text = text.replaceAll(allWhiteSpaceRegExp, ' ');

  const shouldLeftTrim =
    !node.previousSibling ||
    (node.previousSibling.nodeType === Node.ELEMENT_NODE &&
      node.previousSibling.nodeName === 'BR') ||
    preNodeEndsWithSpace;

  const shouldRightTrim = node.nextSibling ? false : nextSiblingWithSpace(node);

  if (shouldLeftTrim) {
    text = text.replace(startWhiteSpaceRegExp, '');
  }

  if (shouldRightTrim) {
    text = text.replace(endWhiteSpaceRegExp, '');
  }

  setNodeText(node, text);
}

function stripWhitespaceByStyle(
  node: HTMLElement,
  whiteSpaceStyle: string,
  preNodeEndsWithSpace: boolean
) {
  switch (whiteSpaceStyle) {
    case 'unset':
    case 'initial': // Browser's default styles.
    case 'normal':
    case 'nowrap': {
      stripWhitespaceNormal(node, preNodeEndsWithSpace);
      break;
    }
    // For white-space: pre or pre-line:
    // Do not strip any \n from the start of the text node
    // Strip exactly one \n from the end of the text node
    case 'pre-line': {
      setNodeText(node, (val) =>
        val.replaceAll(/[\t ]+/g, ' ').replaceAll(oneLineFromEndRegExp, '')
      );
      break;
    }
    case 'pre': {
      setNodeText(node, (val) => val.replaceAll(oneLineFromEndRegExp, ''));
      break;
    }
    // "revert" and "revert-layer" are expected to be supported in the future.
    // eslint-disable-next-line unicorn/no-useless-switch-case
    case 'break-spaces':
    // eslint-disable-next-line unicorn/no-useless-switch-case
    case 'pre-wrap':
    // eslint-disable-next-line unicorn/no-useless-switch-case
    case 'revert':
    // eslint-disable-next-line unicorn/no-useless-switch-case
    case 'revert-layer':
    default: {
      break;
    }
  }
}

function stripWhitespaceByNodeName(node: HTMLElement, nodeName: string) {
  switch (nodeName) {
    case 'pre': {
      setNodeText(node, (val) =>
        val
          .replaceAll(oneLineFromStartRegExp, '')
          .replaceAll(oneLineFromEndRegExp, '')
      );
      break;
    }
    default: {
      break;
    }
  }
}

// TODO: FXI packages\serializer-docx\src\deserializer\__tests__
// There are issues when importing DOCX documents.
// Handling DOCX files is completely different from handling web pages
// Handling of display: inline and inline-block is pending
export function stripWhitespace(root: HTMLElement) {
  let nodeEndsWithSpace: boolean = false;
  let preNodeEndsWithSpace: boolean = false;

  const preprocess = (node: HTMLElement | null) => {
    if (node == null) {
      return;
    }

    if (isHtmlText(node)) {
      nodeEndsWithSpace =
        Boolean(node.textContent) &&
        /[^\S\u00A0]/.test(
          node.textContent?.charAt(node.textContent?.length - 1) || ''
        );

      const [isWhiteSpaceParent, whitespaceStyle, nodeName] =
        getWhitespaceParent(node);

      if (isWhiteSpaceParent) {
        whitespaceStyle &&
          stripWhitespaceByStyle(node, whitespaceStyle, preNodeEndsWithSpace);
        stripWhitespaceByNodeName(node, nodeName);
      } else {
        stripWhitespaceNormal(node, preNodeEndsWithSpace);
      }

      preNodeEndsWithSpace = nodeEndsWithSpace;
    } else {
      nodeEndsWithSpace = false;
    }
  };

  for (
    let node = root, lastNode = node;
    node;
    lastNode = node, node = walk(node) as HTMLElement
  ) {
    const tempNode = node;

    if (tempNode.parentNode == null && tempNode !== root) {
      node = lastNode;
    }

    preprocess(tempNode);
  }
}
