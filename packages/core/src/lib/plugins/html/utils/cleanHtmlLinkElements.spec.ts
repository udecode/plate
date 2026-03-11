import { cleanHtmlLinkElements } from './cleanHtmlLinkElements';

describe('cleanHtmlLinkElements', () => {
  it('unwraps fragment links but keeps their children', () => {
    const root = document.createElement('div');

    root.innerHTML = '<a href="#footnote"><span>Jump</span></a>';

    cleanHtmlLinkElements(root);

    expect(root.querySelector('a')).toBeNull();
    expect(root.textContent).toBe('Jump');
  });

  it('unwraps empty spans inside image links but keeps the image link itself', () => {
    const root = document.createElement('div');

    root.innerHTML =
      '<a href="https://platejs.org"><span></span><img src="/x.png" /><span>caption</span></a>';

    cleanHtmlLinkElements(root);

    expect(root.querySelector('a')).not.toBeNull();
    expect(root.querySelectorAll('span')).toHaveLength(1);
    expect(root.querySelector('span')?.textContent).toBe('caption');
  });
});
