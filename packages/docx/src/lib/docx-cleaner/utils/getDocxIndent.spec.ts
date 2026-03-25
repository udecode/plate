import { getDocxIndent, getDocxTextIndent } from './getDocxIndent';

describe('getDocxIndent', () => {
  it('converts pt and inch indentation values into docx steps', () => {
    const paragraph = document.createElement('p');

    paragraph.style.marginLeft = '72pt';
    expect(getDocxIndent(paragraph)).toBe(2);

    paragraph.style.marginLeft = '.5in';
    expect(getDocxIndent(paragraph)).toBe(1);
  });

  it('ignores negative values and reads text indentation separately', () => {
    const paragraph = document.createElement('p');

    paragraph.style.marginLeft = '-36pt';
    paragraph.style.textIndent = '108pt';

    expect(getDocxIndent(paragraph)).toBe(0);
    expect(getDocxTextIndent(paragraph)).toBe(3);
  });
});
