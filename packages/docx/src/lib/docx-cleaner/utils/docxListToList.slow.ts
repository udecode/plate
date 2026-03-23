import * as bookmarkModule from './isDocxBookmark';
import * as contentModule from './getDocxListContentHtml';
import * as indentModule from './getDocxListIndent';
import * as listModule from './isDocxList';
import * as orderedModule from './isDocxOl';
import { docxListToList } from './docxListToList';

describe('docxListToList', () => {
  it('converts consecutive docx list nodes into a real list and removes them', () => {
    const isDocxBookmarkSpy = spyOn(
      bookmarkModule,
      'isDocxBookmark'
    ).mockReturnValue(false);
    const getDocxListContentHtmlSpy = spyOn(
      contentModule,
      'getDocxListContentHtml'
    ).mockImplementation((element) =>
      element.getAttribute('data-label') === 'one' ? 'One' : 'Two'
    );
    const getDocxListIndentSpy = spyOn(
      indentModule,
      'getDocxListIndent'
    ).mockReturnValue(1);
    const isDocxListSpy = spyOn(listModule, 'isDocxList').mockImplementation(
      (element) => element.tagName === 'P'
    );
    const isDocxOlSpy = spyOn(orderedModule, 'isDocxOl').mockReturnValue(true);
    const document = new DOMParser().parseFromString(
      '<div><p data-label="one"></p><p data-label="two"></p><div id="stop"></div></div>',
      'text/html'
    );
    const first = document.querySelector('p[data-label="one"]')!;
    const stop = document.querySelector('#stop')!;

    const { list, nextSibling } = docxListToList(first);

    expect(list?.outerHTML).toBe('<ol><li>One</li><li>Two</li></ol>');
    expect(nextSibling).toBe(stop);
    expect(document.querySelectorAll('p')).toHaveLength(0);

    isDocxBookmarkSpy.mockRestore();
    getDocxListContentHtmlSpy.mockRestore();
    getDocxListIndentSpy.mockRestore();
    isDocxListSpy.mockRestore();
    isDocxOlSpy.mockRestore();
  });
});
