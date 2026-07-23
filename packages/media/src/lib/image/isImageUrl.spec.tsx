import { isImageUrl } from './isImageUrl';

describe('isImageUrl', () => {
  it.each([
    ['accepts image URLs', 'https://i.imgur.com/removed.png', true],
    [
      'accepts uppercase image extensions',
      'https://example.com/photo.PNG',
      true,
    ],
    ['rejects URLs without an image extension', '//google.com', false],
    ['rejects plain text', 'hello', false],
  ])('%s', (_label, input, expected) => {
    expect(isImageUrl(input)).toBe(expected);
  });
});
