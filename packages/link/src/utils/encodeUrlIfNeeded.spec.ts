import { encodeUrlIfNeeded } from './encodeUrlIfNeeded';

describe('encodeUrlIfNeeded', () => {
  it('does not transform URL containing no special characters', () => {
    const url =
      'https://username:password@example.com:1234/path?query=value#fragment';
    expect(encodeUrlIfNeeded(url)).toEqual(url);
  });

  it('does not transform URL containing encoded characters', () => {
    const url =
      'https://example.com/path%20with%20spaces?query=value%2Bencoded';
    expect(encodeUrlIfNeeded(url)).toEqual(url);
  });

  it('does not transform URL containing both encoded and special characters', () => {
    const url = 'https://example.com/path%20with%20spaces?query=あ';
    expect(encodeUrlIfNeeded(url)).toEqual(url);
  });

  it('encodes URL containing special characters', () => {
    const url = 'https://example.com/path?query=あ';
    expect(encodeUrlIfNeeded(url)).toEqual(
      'https://example.com/path?query=%E3%81%82'
    );
  });

  it('handles malformed URI sequence', () => {
    const url = 'https://example.com/%';
    expect(encodeUrlIfNeeded(url)).toEqual(url);
  });

  it('handles empty string', () => {
    const url = '';
    expect(encodeUrlIfNeeded(url)).toEqual(url);
  });

  it('handles non-URI strings', () => {
    const url = 'Just a random string without URI format';
    expect(encodeUrlIfNeeded(url)).toEqual(
      'Just%20a%20random%20string%20without%20URI%20format'
    );
  });
});
