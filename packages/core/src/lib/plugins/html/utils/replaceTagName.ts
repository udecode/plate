export const replaceTagName = (element: Element, tagName: string): Element => {
  const newElement = element.ownerDocument.createElement(tagName);

  newElement.append(...Array.from(element.childNodes));

  for (const { name } of element.attributes) {
    const value = element.getAttribute(name);

    if (value) {
      newElement.setAttribute(name, value);
    }
  }

  if (element.parentNode) {
    element.parentNode.replaceChild(newElement, element);
  }

  return newElement;
};
