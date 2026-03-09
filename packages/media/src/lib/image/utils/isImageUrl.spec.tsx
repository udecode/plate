import { isImageUrl } from './isImageUrl';

describe('isImageUrl', () => {
  it.each([
    ['accepts image URLs', 'https://i.imgur.com/removed.png', true],
    ['rejects URLs without an image extension', '//google.com', false],
    ['rejects plain text', 'hello', false],
  ])('%s', (_label, input, expected) => {
    expect(isImageUrl(input)).toBe(expected);
  });
});
