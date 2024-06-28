import { encodeUrlIfNeeded } from './encodeUrlIfNeeded';

describe('isEncoded function', () => {
  it('should return false for an unencoded URI', () => {
    const url = 'https://example.com/path?query=value';
    expect(encodeUrlIfNeeded(url)).toEqual(url);
  });

  it('should return true for an encoded URI with special characters', () => {
    const url = 'https://example.com/path%20with%20spaces?query=value%2Bencoded';
    expect(encodeUrlIfNeeded(url)).toEqual(url);
  });

  it('should handle URI with no changes after decoding', () => {
    const url = 'https://example.com/simplepath';
    expect(encodeUrlIfNeeded(url)).toEqual(url);
  });

  it('should handle empty string', () => {
    const url = '';
    expect(encodeUrlIfNeeded(url)).toEqual(url);
  });

  it('should handle URI with only encoding characters', () => {
    const url = '%20%21%22%23%24%25%26%27%28%29%2A%2B%2C%2F%3A%3B%3D%40%20%21%22%23%24%25%26%27%28%29%2A%2B%2C%2F%3A%3B%3D%40';
    expect(encodeUrlIfNeeded(url)).toEqual(url);
  });

  it('should handle non-URI strings', () => {
    const url = 'Just a random string without URI format';
    expect(encodeUrlIfNeeded(url)).toEqual('Just%20a%20random%20string%20without%20URI%20format');
  });
});
