import { cleanHtmlFontElements } from './cleanHtmlFontElements';

describe('cleanHtmlFontElements', () => {
  it('replaces text-bearing font tags with spans and removes empty font tags', () => {
    const root = document.createElement('div');

    root.innerHTML =
      '<font color="red">Hello</font><font></font><span>keep</span>';

    cleanHtmlFontElements(root);

    expect(root.children).toHaveLength(2);
    expect(root.children[0].tagName).toBe('SPAN');
    expect(root.children[0].textContent).toBe('Hello');
    expect(root.children[1].outerHTML).toBe('<span>keep</span>');
  });
});
