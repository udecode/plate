import { getListContentHtml } from './getListContentHtml';
import { getListLevel } from './getListLevel';
import { isBookmark } from './isBookmark';
import { isList } from './isList';
import { isOrderedList } from './isOrderedList';
import { parseHtmlElement } from './parseHtmlElement';

interface Result {
  list: Element | null;
  nextSibling: Element | null;
}

export const buildList = (element: Element): Result => {
  const listLevel = getListLevel(element);
  let listHtml = '';
  let nextSibling: Element | null = element;

  while (nextSibling) {
    if (isBookmark(nextSibling)) {
      nextSibling = nextSibling.nextElementSibling;
      continue;
    }

    if (!isList(nextSibling)) {
      break;
    }

    const nextListLevel = getListLevel(nextSibling);

    if (nextListLevel < listLevel) {
      // Lower level found. Current list is done.
      break;
    }

    if (nextListLevel > listLevel) {
      const nestedList = buildList(nextSibling);

      if (nestedList.list) {
        listHtml += nestedList.list.outerHTML;
      }

      nextSibling = nestedList.nextSibling;
      continue;
    }

    listHtml += `<li>${getListContentHtml(nextSibling)}</li>`;
    const currentElement = nextSibling;
    nextSibling = currentElement.nextElementSibling;
    currentElement.remove();
  }

  const listTagName = isOrderedList(element) ? 'ol' : 'ul';
  const list = parseHtmlElement(`<${listTagName}>${listHtml}</${listTagName}>`);

  return { list, nextSibling };
};
