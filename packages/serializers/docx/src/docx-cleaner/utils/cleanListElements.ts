import { buildList } from './buildList';
import { isList } from './isList';
import { traverseElements } from './traverseElements';

export const cleanListElements = (rootNode: Node): void => {
  traverseElements(rootNode, (element) => {
    const styleAttribute = element.getAttribute('style');

    if (styleAttribute) {
      element.setAttribute(
        'style',
        styleAttribute.replace(/mso-list:\s*Ignore/gim, 'mso-list:Ignore')
      );
    }

    return true;
  });

  traverseElements(rootNode, (element) => {
    if (!isList(element)) {
      return true;
    }

    const { parentElement, previousSibling } = element;

    if (!parentElement) {
      return true;
    }

    const { list } = buildList(element);

    if (!list) {
      return true;
    }

    const beforeElement = previousSibling
      ? previousSibling.nextSibling
      : parentElement.firstChild;

    if (beforeElement) {
      parentElement.insertBefore(list, beforeElement);
    } else {
      parentElement.appendChild(list);
    }

    return false;
  });
};
