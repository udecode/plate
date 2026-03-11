import { getHtmlComments } from './getHtmlComments';

describe('getHtmlComments', () => {
  it('collects non-empty html comment contents in document order', () => {
    const root = document.createElement('div');

    root.innerHTML = '<!--alpha--><span>text</span><!----><!--beta-->';

    expect(getHtmlComments(root)).toEqual(['alpha', 'beta']);
  });
});
