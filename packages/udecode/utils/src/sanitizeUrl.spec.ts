import { sanitizeUrl } from './sanitizeUrl';

describe('sanitizeUrl', () => {
  describe('when permitInvalid is false', () => {
    const options = {
      allowedSchemes: ['http'],
      permitInvalid: false,
    };

    it('returns null when url is invalid', () => {
      expect(sanitizeUrl('invalid', options)).toBeNull();
    });

    it('returns null when url has disallowed scheme', () => {
      expect(sanitizeUrl('javascript://example.com/', options)).toBeNull();
    });

    it('returns url when url is valid', () => {
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

    it('returns url when url is invalid', () => {
      expect(sanitizeUrl('invalid', options)).toBe('invalid');
    });

    it('returns null when url has disallowed scheme', () => {
      expect(sanitizeUrl('javascript://example.com/', options)).toBeNull();
    });

    it('returns url when url is valid', () => {
      expect(sanitizeUrl('http://example.com/', options)).toBe(
        'http://example.com/'
      );
    });
  });
});
