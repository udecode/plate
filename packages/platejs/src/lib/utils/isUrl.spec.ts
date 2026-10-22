import { isUrl } from './isUrl';

describe('is-url', () => {
  describe('valid', () => {
    it('http://google.com', () => {
      expect(isUrl('http://google.com')).toBe(true);
    });

    it('https://google.com', () => {
      expect(isUrl('https://google.com')).toBe(true);
    });

    it('ftp://google.com', () => {
      expect(isUrl('ftp://google.com')).toBe(true);
    });

    it('http://www.google.com', () => {
      expect(isUrl('http://www.google.com')).toBe(true);
    });

    it('http://google.com/something', () => {
      expect(isUrl('http://google.com/something')).toBe(true);
    });

    it('http://google.com?q=query', () => {
      expect(isUrl('http://google.com?q=query')).toBe(true);
    });

    it('http://google.com#hash', () => {
      expect(isUrl('http://google.com#hash')).toBe(true);
    });

    it('http://google.com/something?q=query#hash', () => {
      expect(isUrl('http://google.com/something?q=query#hash')).toBe(true);
    });

    it('http://google.co.uk', () => {
      expect(isUrl('http://google.co.uk')).toBe(true);
    });

    it('http://www.google.co.uk', () => {
      expect(isUrl('http://www.google.co.uk')).toBe(true);
    });

    it('http://google.cat', () => {
      expect(isUrl('http://google.cat')).toBe(true);
    });

    it('accepts an authenticated Sentry URL', () => {
      expect(isUrl('https://fixture@app.getsentry.com/13176')).toBe(true);
    });

    it('http://0.0.0.0', () => {
      expect(isUrl('http://0.0.0.0')).toBe(true);
    });

    it('http://localhost', () => {
      expect(isUrl('http://localhost')).toBe(true);
    });

    it('accepts Postgres user info', () => {
      expect(isUrl('postgres://u:p@example.com:5702/db')).toBe(true);
    });

    it('accepts Redis user info', () => {
      expect(isUrl(['redis://:', '123@174.129.42.52:13271'].join(''))).toBe(
        true
      );
    });

    it('accepts MongoDB user info', () => {
      expect(isUrl(['mongodb://u:', 'p@example.com:10064/db'].join(''))).toBe(
        true
      );
    });

    it('ws://chat.example.com/games', () => {
      expect(isUrl('ws://chat.example.com/games')).toBe(true);
    });

    it('wss://secure.example.com/biz', () => {
      expect(isUrl('wss://secure.example.com/biz')).toBe(true);
    });

    it('http://localhost:4000', () => {
      expect(isUrl('http://localhost:4000')).toBe(true);
    });

    it('http://localhost:342/a/path', () => {
      expect(isUrl('http://localhost:342/a/path')).toBe(true);
    });

    it('mailto:sample-mail@gmail.com', () => {
      expect(isUrl('mailto:sample-mail@gmail.com')).toBe(true);
    });
  });

  describe('invalid', () => {
    it('//google.com', () => {
      expect(isUrl('//google.com')).toBe(false);
    });

    it('http://', () => {
      expect(isUrl('http://')).toBe(false);
    });

    it('http://google', () => {
      expect(isUrl('http://google')).toBe(false);
    });

    it('http://google.', () => {
      expect(isUrl('http://google.')).toBe(false);
    });

    it('google', () => {
      expect(isUrl('google')).toBe(false);
    });

    it('google.com', () => {
      expect(isUrl('google.com')).toBe(false);
    });

    it('empty', () => {
      expect(isUrl('')).toBe(false);
    });

    it('null', () => {
      expect(isUrl(null)).toBe(false);
    });

    it('undefined', () => {
      expect(isUrl(undefined)).toBe(false);
    });

    it('object', () => {
      expect(isUrl({})).toBe(false);
    });

    it('re', () => {
      expect(isUrl(/abc/)).toBe(false);
    });

    it('mailto:', () => {
      expect(isUrl('mailto:')).toBe(false);
    });

    it('whitespace in hostname', () => {
      expect(isUrl('https://exa mple.com')).toBe(false);
    });
  });

  describe('redos', () => {
    it('redos exploit', () => {
      const attackString = `a://localhost${'9'.repeat(100_000)}\t`;

      expect(isUrl(attackString)).toBe(false);
    });
  });
});
