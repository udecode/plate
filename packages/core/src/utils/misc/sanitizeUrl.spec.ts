import { sanitizeUrl } from './sanitizeUrl';

describe('sanitizeUrl', () => {
  describe('when permitInvalid is false', () => {
    const options = {
      allowedSchemes: ['http'],
      permitInvalid: false,
    };

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

  describe('when permitInvalid is true', () => {
    const options = {
      allowedSchemes: ['http'],
      permitInvalid: true,
    };

    it('should return url when url is invalid', () => {
      expect(sanitizeUrl('invalid', options)).toBe('invalid');
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
});
