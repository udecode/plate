import { safeDecodeUrl } from './safeDecodeUrl';

describe('safeDecodeUrl', () => {
  it('decodes URL', () => {
    const url = 'https://example.com/path?query=%E3%81%82';
    expect(safeDecodeUrl(url)).toEqual('https://example.com/path?query=あ');
  });

  it('handles malformed URI sequence', () => {
    const url = 'https://example.com/path?query=%';
    expect(safeDecodeUrl(url)).toEqual(url);
  });
});
