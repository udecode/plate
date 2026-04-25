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

  it('extracts an allowlisted twitter/x status url from embed snippet html', () => {
    expect(
      parseIframeUrl(
        '<blockquote class="twitter-tweet"><a href="https://x.com/platejs/status/1234567890"></a></blockquote><script async src="https://platform.twitter.com/widgets.js"></script>'
      )
    ).toBe('https://x.com/platejs/status/1234567890');
  });

  it('does not treat arbitrary script embed markup as a baseline iframe source', () => {
    const scriptEmbed =
      '<script async src="https://example.com/widgets.js"></script>';

    expect(parseIframeUrl(scriptEmbed)).toBe(scriptEmbed);
  });
});
