/* eslint-disable jest/no-commented-out-tests */
import { isUrl } from './isUrl';

describe('is-url', () => {
  describe('valid', () => {
    it('http://google.com', () => {
      expect(isUrl('http://google.com')).toBeTruthy();
    });

    it('https://google.com', () => {
      expect(isUrl('https://google.com')).toBeTruthy();
    });

    it('ftp://google.com', () => {
      expect(isUrl('ftp://google.com')).toBeTruthy();
    });

    it('http://www.google.com', () => {
      expect(isUrl('http://www.google.com')).toBeTruthy();
    });

    it('http://google.com/something', () => {
      expect(isUrl('http://google.com/something')).toBeTruthy();
    });

    it('http://google.com?q=query', () => {
      expect(isUrl('http://google.com?q=query')).toBeTruthy();
    });

    it('http://google.com#hash', () => {
      expect(isUrl('http://google.com#hash')).toBeTruthy();
    });

    it('http://google.com/something?q=query#hash', () => {
      expect(isUrl('http://google.com/something?q=query#hash')).toBeTruthy();
    });

    it('http://google.co.uk', () => {
      expect(isUrl('http://google.co.uk')).toBeTruthy();
    });

    it('http://www.google.co.uk', () => {
      expect(isUrl('http://www.google.co.uk')).toBeTruthy();
    });

    it('http://google.cat', () => {
      expect(isUrl('http://google.cat')).toBeTruthy();
    });

    it('https://d1f4470da51b49289906b3d6cbd65074@app.getsentry.com/13176', () => {
      expect(
        isUrl(
          'https://d1f4470da51b49289906b3d6cbd65074@app.getsentry.com/13176'
        )
      ).toBeTruthy();
    });

    it('http://0.0.0.0', () => {
      expect(isUrl('http://0.0.0.0')).toBeTruthy();
    });

    it('http://localhost', () => {
      expect(isUrl('http://localhost')).toBeTruthy();
    });

    it('postgres://u:p@example.com:5702/db', () => {
      expect(isUrl('postgres://u:p@example.com:5702/db')).toBeTruthy();
    });

    it('redis://:123@174.129.42.52:13271', () => {
      expect(isUrl('redis://:123@174.129.42.52:13271')).toBeTruthy();
    });

    it('mongodb://u:p@example.com:10064/db', () => {
      expect(isUrl('mongodb://u:p@example.com:10064/db')).toBeTruthy();
    });

    it('ws://chat.example.com/games', () => {
      expect(isUrl('ws://chat.example.com/games')).toBeTruthy();
    });

    it('wss://secure.example.com/biz', () => {
      expect(isUrl('wss://secure.example.com/biz')).toBeTruthy();
    });

    it('http://localhost:4000', () => {
      expect(isUrl('http://localhost:4000')).toBeTruthy();
    });

    it('http://localhost:342/a/path', () => {
      expect(isUrl('http://localhost:342/a/path')).toBeTruthy();
    });

    it('mailto:sample-mail@gmail.com', () => {
      expect(isUrl('mailto:sample-mail@gmail.com')).toBeTruthy();
    });
  });

  describe('invalid', () => {
    it('//google.com', () => {
      expect(!isUrl('//google.com')).toBeTruthy();
    });

    it('http://', () => {
      expect(!isUrl('http://')).toBeTruthy();
    });

    it('http://google', () => {
      expect(!isUrl('http://google')).toBeTruthy();
    });

    it('http://google.', () => {
      expect(!isUrl('http://google.')).toBeTruthy();
    });

    it('google', () => {
      expect(!isUrl('google')).toBeTruthy();
    });

    it('google.com', () => {
      expect(!isUrl('google.com')).toBeTruthy();
    });

    it('empty', () => {
      expect(!isUrl('')).toBeTruthy();
    });

    it('undef', () => {
      expect(!isUrl(undefined)).toBeTruthy();
    });

    it('object', () => {
      expect(!isUrl({})).toBeTruthy();
    });

    it('re', () => {
      expect(!isUrl(/abc/)).toBeTruthy();
    });

    it('mailto:', () => {
      expect(!isUrl('mailto:')).toBeTruthy();
    });
  });

  describe('redos', () => {
    it('redos exploit', () => {
      // Invalid. This should be discovered in under 1 second.
      const attackString = `a://localhost${'9'.repeat(100000)}\t`;
      const before = process.hrtime();

      expect(!isUrl(attackString)).toBeTruthy();

      const elapsed = process.hrtime(before);
      expect(elapsed[0] < 1).toBeTruthy();
    });
  });
});
