import { traverseElements } from './traverseElements';

const ALLOWED_EMPTY_ELEMENTS = ['BR', 'IMG'];

const isEmpty = (element: Element): boolean => {
  return (
    !ALLOWED_EMPTY_ELEMENTS.includes(element.nodeName) &&
    !element.innerHTML.trim()
  );
};

const removeIfEmpty = (element: Element): void => {
  if (isEmpty(element)) {
    const { parentElement } = element;

    element.remove();

    if (parentElement) {
      removeIfEmpty(parentElement);
    }
  }
};

export const cleanEmptyElements = (rootNode: Node): void => {
  traverseElements(rootNode, (element) => {
    removeIfEmpty(element);
    return true;
  });
};
