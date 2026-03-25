import { isDocxOl } from './isDocxOl';

describe('isDocxOl', () => {
  it('returns false when no docx list node is present', () => {
    const element = new DOMParser().parseFromString('<p>plain</p>', 'text/html')
      .body.firstElementChild!;

    expect(isDocxOl(element)).toBe(false);
  });

  it('detects ordered-list markers from the docx list node', () => {
    const element = new DOMParser().parseFromString(
      '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">1.</span>Item</p>',
      'text/html'
    ).body.firstElementChild!;

    expect(isDocxOl(element)).toBe(true);
  });
});
