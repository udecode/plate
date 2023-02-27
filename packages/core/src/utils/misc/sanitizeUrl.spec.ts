import { sanitizeUrl } from './sanitizeUrl';

describe('sanitizeUrl', () => {
  const options = {
    allowedSchemes: ['http'],
  };

  it('should return null when url is empty', () => {
    expect(sanitizeUrl('', options)).toBeNull();
  });

  it('should return null when url is invalid', () => {
    expect(sanitizeUrl('invalid', options)).toBeNull();
  });

  it('should return null when url has disallowed scheme', () => {
    // eslint-disable-next-line no-script-url
    expect(sanitizeUrl('javascript://example.com/', options)).toBeNull();
  });

  it('should return url when url is valid', () => {
    expect(sanitizeUrl('http://example.com/', options)).toBe(
      'http://example.com/'
    );
  });
});
