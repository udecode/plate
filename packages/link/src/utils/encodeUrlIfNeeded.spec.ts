import { isEncoded } from './encodeUrlIfNeeded';

describe('encodeUrlIfNeeded', () => {
  describe('when url is encoded', () => {
    const url = 'https://www.baidu.com/s?wd=platejs%E6%8F%92%E4%BB%B6';

    it('the url is encoded', () => {
      expect(isEncoded(url)).toEqual(true);
    });
  });

  describe('when url is encoded', () => {
    const url = 'https://www.baidu.com/s?wd=platejs插件';

    it('the url is not encoded', () => {
      expect(isEncoded(url)).toEqual(false);
    });
  });
});
