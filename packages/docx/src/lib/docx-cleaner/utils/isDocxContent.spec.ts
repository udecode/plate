import { isDocxContent } from './isDocxContent';

const parseBody = (html: string) =>
  new DOMParser().parseFromString(html, 'text/html').body;

describe('isDocxContent', () => {
  it('detects Word html through mso styles and Mso class names', () => {
    expect(
      isDocxContent(
        parseBody('<div><p style="mso-list:l0 level1 lfo1">x</p></div>')
      )
    ).toBe(true);
    expect(
      isDocxContent(parseBody('<div><p class="MsoNormal">x</p></div>'))
    ).toBe(true);
  });

  it('returns false for plain html without Word markers', () => {
    expect(isDocxContent(parseBody('<div><p class="note">x</p></div>'))).toBe(
      false
    );
  });
});
