import { isValidUrl } from './url';

describe('isValidUrl', () => {
  it.each([
    ['https://platejs.org/docs', true],
    ['http://example.com/test?q=1', true],
    ['mailto:test@example.com', false],
    ['/relative/path', false],
    ['notaurl', false],
    [undefined, false],
    [null, false],
  ])('returns %s for %p', (value, expected) => {
    expect(isValidUrl(value as string | null | undefined)).toBe(expected);
  });
});
