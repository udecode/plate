import { parseHtmlElement } from '@udecode/plate-common/server';

import { getDocxListContentHtml } from './getDocxListContentHtml';
import { getDocxListIndent } from './getDocxListIndent';
import { isDocxBookmark } from './isDocxBookmark';
import { isDocxList } from './isDocxList';
import { isDocxOl } from './isDocxOl';

interface Result {
  list: Element | null;
  nextSibling: Element | null;
}

export const docxListToList = (element: Element): Result => {
  const listLevel = getDocxListIndent(element);
  let listHtml = '';
  let nextSibling: Element | null = element;

  while (nextSibling) {
    if (isDocxBookmark(nextSibling)) {
      nextSibling = nextSibling.nextElementSibling;

      continue;
    }
    if (!isDocxList(nextSibling)) {
      break;
    }

    const nextListLevel = getDocxListIndent(nextSibling);

    if (nextListLevel < listLevel) {
      // Lower level found. Current list is done.
      break;
    }
    if (nextListLevel > listLevel) {
      const nestedList = docxListToList(nextSibling);

      if (nestedList.list) {
        listHtml += nestedList.list.outerHTML;
      }

      nextSibling = nestedList.nextSibling;

      continue;
    }

    listHtml += `<li>${getDocxListContentHtml(nextSibling)}</li>`;
    const currentElement = nextSibling;
    nextSibling = currentElement.nextElementSibling;
    currentElement.remove();
  }

  const listTagName = isDocxOl(element) ? 'ol' : 'ul';
  const list = parseHtmlElement(`<${listTagName}>${listHtml}</${listTagName}>`);

  return { list, nextSibling };
};
