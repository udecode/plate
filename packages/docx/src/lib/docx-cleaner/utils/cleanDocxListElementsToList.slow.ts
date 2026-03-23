import { parseHtmlElement } from 'platejs';

import * as listModule from './docxListToList';
import * as isDocxListModule from './isDocxList';
import { cleanDocxListElementsToList } from './cleanDocxListElementsToList';

describe('cleanDocxListElementsToList', () => {
  it('normalizes mso-list ignore casing before list cleanup', () => {
    const isDocxListSpy = spyOn(isDocxListModule, 'isDocxList').mockReturnValue(
      false
    );
    const document = new DOMParser().parseFromString(
      '<div><p style="mso-list: ignore">Item</p></div>',
      'text/html'
    );
    const root = document.body.firstElementChild!;

    cleanDocxListElementsToList(root);

    expect(root.firstElementChild?.getAttribute('style')).toBe(
      'mso-list:Ignore'
    );

    isDocxListSpy.mockRestore();
  });

  it('inserts the converted list before the original list node', () => {
    const isDocxListSpy = spyOn(
      isDocxListModule,
      'isDocxList'
    ).mockImplementation((element) => element.tagName === 'P');
    const docxListToListSpy = spyOn(
      listModule,
      'docxListToList'
    ).mockReturnValue({
      list: parseHtmlElement('<ul><li>Converted</li></ul>'),
      nextSibling: null,
    });
    const document = new DOMParser().parseFromString(
      '<div><p>List</p><div id="after"></div></div>',
      'text/html'
    );
    const root = document.body.firstElementChild!;

    cleanDocxListElementsToList(root);

    expect(root.firstElementChild?.outerHTML).toBe(
      '<ul><li>Converted</li></ul>'
    );

    isDocxListSpy.mockRestore();
    docxListToListSpy.mockRestore();
  });
});
