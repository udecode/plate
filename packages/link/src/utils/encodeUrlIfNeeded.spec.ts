import { isEncoded } from './encodeUrlIfNeeded';

describe('isEncoded function', () => {
  it('should return false for an unencoded URI', () => {
    expect(isEncoded('https://example.com/path?query=value')).toEqual(false);
  });

  it('should return true for an encoded URI with special characters', () => {
    expect(
      isEncoded(
        'https://example.com/path%20with%20spaces?query=value%2Bencoded'
      )
    ).toEqual(true);
  });

  it('should handle URI with no changes after decoding', () => {
    expect(isEncoded('https://example.com/simplepath')).toEqual(false);
  });

  it('should handle empty string', () => {
    expect(isEncoded('')).toEqual(false);
  });

  it('should handle URI with only encoding characters', () => {
    expect(
      isEncoded(
        '%20%21%22%23%24%25%26%27%28%29%2A%2B%2C%2F%3A%3B%3D%40%20%21%22%23%24%25%26%27%28%29%2A%2B%2C%2F%3A%3B%3D%40'
      )
    ).toEqual(true);
  });

  it('should handle non-URI strings', () => {
    expect(isEncoded('Just a random string without URI format')).toEqual(false);
  });
});
