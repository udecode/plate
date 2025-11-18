import type { DOMElement, DOMNode, DOMText } from '@platejs/slate';

const getDefaultView = (value: any): Window | null =>
  value?.ownerDocument?.defaultView || null;

/** Check if a DOM node is an element node. */

const isDOMElement = (value: any): value is DOMElement =>
  isDOMNode(value) && value.nodeType === 1;

/** Check if a value is a DOM node. */

const isDOMNode = (value: any): value is DOMNode => {
  const window = getDefaultView(value);
  return !!window && value instanceof window.Node;
};

/** Check if a DOM node is an element node. */
const isDOMText = (value: any): value is DOMText =>
  isDOMNode(value) && value.nodeType === 3;

export const getPlainText = (domNode: DOMNode) => {
  let text = '';

  if (isDOMText(domNode) && domNode.nodeValue) {
    return domNode.nodeValue;
  }

  if (isDOMElement(domNode)) {
    for (const childNode of Array.from(domNode.childNodes)) {
      text += getPlainText(childNode);
    }

    const display = getComputedStyle(domNode).getPropertyValue('display');

    if (display === 'block' || display === 'list' || domNode.tagName === 'BR') {
      text += '\n';
    }
  }

  return text;
};
