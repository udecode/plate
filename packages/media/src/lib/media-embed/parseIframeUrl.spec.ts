import { parseIframeUrl } from './parseIframeUrl';

describe('parseIframeUrl', () => {
  it('extracts the src url from iframe embed code', () => {
    expect(
      parseIframeUrl(
        '<iframe src="https://www.youtube.com/embed/M7lc1UVf-VE"></iframe>'
      )
    ).toBe('https://www.youtube.com/embed/M7lc1UVf-VE');
  });

  it('returns plain http urls unchanged', () => {
    expect(parseIframeUrl('https://platejs.org/embed')).toBe(
      'https://platejs.org/embed'
    );
  });

  it('returns the original string when no iframe src exists', () => {
    expect(parseIframeUrl('<iframe title="missing-src"></iframe>')).toBe(
      '<iframe title="missing-src"></iframe>'
    );
  });
});
