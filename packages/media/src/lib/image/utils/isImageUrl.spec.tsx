import { isImageUrl } from './isImageUrl';

describe('isImageUrl', () => {
  describe('when text is image url', () => {
    const input = 'https://i.imgur.com/removed.png';

    const output = true;

    it('should be true', () => {
      expect(isImageUrl(input)).toEqual(output);
    });
  });

  describe('when text is url without image extension', () => {
    const input = '//google.com';

    const output = false;

    it('should be false', () => {
      expect(isImageUrl(input)).toEqual(output);
    });
  });

  describe('when text is not url', () => {
    const input = 'hello';

    const output = false;

    it('should be false', () => {
      expect(isImageUrl(input)).toEqual(output);
    });
  });
});
