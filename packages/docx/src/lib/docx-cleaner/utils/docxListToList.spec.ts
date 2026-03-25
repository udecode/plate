import * as bookmarkModule from './isDocxBookmark';
import * as contentModule from './getDocxListContentHtml';
import * as indentModule from './getDocxListIndent';
import * as listModule from './isDocxList';
import * as orderedModule from './isDocxOl';
import { docxListToList } from './docxListToList';

describe('docxListToList', () => {
  afterEach(() => {
    mock.restore();
  });

  it('converts consecutive docx list nodes into a real list and removes them', () => {
    spyOn(bookmarkModule, 'isDocxBookmark').mockReturnValue(false);
    spyOn(contentModule, 'getDocxListContentHtml').mockImplementation(
      (element) =>
        element.getAttribute('data-label') === 'one' ? 'One' : 'Two'
    );
    spyOn(indentModule, 'getDocxListIndent').mockReturnValue(1);
    spyOn(listModule, 'isDocxList').mockImplementation(
      (element) => element.tagName === 'P'
    );
    spyOn(orderedModule, 'isDocxOl').mockReturnValue(true);
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
  });

  it('skips bookmarks and appends nested lists before returning the next sibling', () => {
    spyOn(bookmarkModule, 'isDocxBookmark').mockImplementation(
      (element) => element.tagName === 'SPAN'
    );
    spyOn(contentModule, 'getDocxListContentHtml').mockImplementation(
      (element) => element.getAttribute('data-label') ?? ''
    );
    spyOn(indentModule, 'getDocxListIndent').mockImplementation((element) =>
      Number(element.getAttribute('data-level') ?? 1)
    );
    spyOn(listModule, 'isDocxList').mockImplementation(
      (element) => element.tagName === 'P'
    );
    spyOn(orderedModule, 'isDocxOl').mockReturnValue(true);

    const document = new DOMParser().parseFromString(
      '<div><p data-label="one" data-level="1"></p><span data-bookmark="true"></span><p data-label="nested" data-level="2"></p><div id="stop"></div></div>',
      'text/html'
    );
    const first = document.querySelector('p[data-label="one"]')!;
    const bookmark = document.querySelector('span[data-bookmark="true"]')!;
    const stop = document.querySelector('#stop')!;

    const { list, nextSibling } = docxListToList(first);

    expect(list?.outerHTML).toContain('<li>one</li>');
    expect(list?.outerHTML).toContain('<ol><li>nested</li></ol>');
    expect(nextSibling).toBe(stop);
    expect(bookmark.isConnected).toBe(true);
    expect(document.querySelectorAll('p')).toHaveLength(0);
  });
});
