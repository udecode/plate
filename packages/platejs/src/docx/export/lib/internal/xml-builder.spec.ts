/**
 * Unit tests for color conversion utilities.
 * Tests conversion between various color formats to DOCX hex format:
 * - RGB to Hex (takes separate r, g, b values)
 * - HSL to Hex (takes separate h, s, l values)
 * - Hex shorthand expansion (takes separate r, g, b hex chars)
 */

import {
  hex3Regex,
  hex3ToHex,
  hexRegex,
  hslRegex,
  hslToHex,
  rgbRegex,
  rgbToHex,
  getImageDimensions,
  imageToBase64,
  isValidUrl,
} from './xml-builder';

describe('color conversion', () => {
  describe('regex patterns', () => {
    it('rgbRegex matches RGB values', () => {
      expect(rgbRegex.test('rgb(255, 0, 0)')).toBe(true);
      // space after comma is optional
      expect(rgbRegex.test('rgb(0,0,0)')).toBe(true);
      expect(rgbRegex.test('rgb(128, 128, 128)')).toBe(true);
      expect(rgbRegex.test('#FF0000')).toBe(false);
    });

    it('hslRegex matches HSL values', () => {
      expect(hslRegex.test('hsl(0, 100%, 50%)')).toBe(true);
      expect(hslRegex.test('hsl(120, 50%, 50%)')).toBe(true);
      expect(hslRegex.test('rgb(255, 0, 0)')).toBe(false);
    });

    it('hexRegex matches 6-digit hex values', () => {
      expect(hexRegex.test('#FF0000')).toBe(true);
      expect(hexRegex.test('#ffffff')).toBe(true);
      expect(hexRegex.test('#123456')).toBe(true);
    });

    it('hex3Regex matches 3-digit hex patterns', () => {
      expect(hex3Regex.test('#F00')).toBe(true);
      expect(hex3Regex.test('#fff')).toBe(true);
      expect(hex3Regex.test('#123')).toBe(true);
    });
  });

  describe('rgbToHex', () => {
    it('convert RGB black to hex', () => {
      expect(rgbToHex(0, 0, 0)).toBe('000000');
    });

    it('convert RGB white to hex', () => {
      expect(rgbToHex(255, 255, 255)).toBe('ffffff');
    });

    it('convert RGB red to hex', () => {
      expect(rgbToHex(255, 0, 0)).toBe('ff0000');
    });

    it('convert RGB green to hex', () => {
      expect(rgbToHex(0, 255, 0)).toBe('00ff00');
    });

    it('convert RGB blue to hex', () => {
      expect(rgbToHex(0, 0, 255)).toBe('0000ff');
    });

    it('convert mixed RGB values', () => {
      expect(rgbToHex(128, 64, 32)).toBe('804020');
    });

    it('handle string inputs', () => {
      expect(rgbToHex('255', '128', '0')).toBe('ff8000');
    });
  });

  describe('hslToHex', () => {
    it('convert HSL red to hex', () => {
      const result = hslToHex(0, 100, 50);
      expect(result.toLowerCase()).toBe('ff0000');
    });

    it('convert HSL green to hex', () => {
      const result = hslToHex(120, 100, 50);
      expect(result.toLowerCase()).toBe('00ff00');
    });

    it('convert HSL blue to hex', () => {
      const result = hslToHex(240, 100, 50);
      expect(result.toLowerCase()).toBe('0000ff');
    });

    it('convert HSL black to hex', () => {
      const result = hslToHex(0, 0, 0);
      expect(result.toLowerCase()).toBe('000000');
    });

    it('convert HSL white to hex', () => {
      const result = hslToHex(0, 0, 100);
      expect(result.toLowerCase()).toBe('ffffff');
    });

    it('convert HSL gray to hex', () => {
      const result = hslToHex(0, 0, 50);
      // Gray should be around 808080
      expect(result.toLowerCase()).toMatch(
        /^[78][0-9a-f][78][0-9a-f][78][0-9a-f]$/
      );
    });
  });

  describe('hex3ToHex', () => {
    it('expand F, 0, 0 to FF0000', () => {
      expect(hex3ToHex('F', '0', '0')).toBe('FF0000');
    });

    it('expand 0, F, 0 to 00FF00', () => {
      expect(hex3ToHex('0', 'F', '0')).toBe('00FF00');
    });

    it('expand 0, 0, F to 0000FF', () => {
      expect(hex3ToHex('0', '0', 'F')).toBe('0000FF');
    });

    it('expand F, F, F to FFFFFF', () => {
      expect(hex3ToHex('F', 'F', 'F')).toBe('FFFFFF');
    });

    it('expand 0, 0, 0 to 000000', () => {
      expect(hex3ToHex('0', '0', '0')).toBe('000000');
    });

    it('expand lowercase a, b, c to aabbcc', () => {
      expect(hex3ToHex('a', 'b', 'c')).toBe('aabbcc');
    });

    it('expand 1, 2, 3 to 112233', () => {
      expect(hex3ToHex('1', '2', '3')).toBe('112233');
    });
  });
});

describe('image conversion', () => {
  afterEach(() => {
    mock.restore();
  });

  it('reads PNG, JPEG, GIF, BMP, WebP, and fallback dimensions', () => {
    const png = new Uint8Array(24);
    png.set([0x89, 0x50, 0x4e, 0x47], 0);
    png.set([0x00, 0x00, 0x01, 0x40], 16);
    png.set([0x00, 0x00, 0x00, 0xf0], 20);

    const jpeg = new Uint8Array([
      0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x20, 0x00, 0x30,
    ]);
    const gif = new Uint8Array(10);
    gif.set([0x47, 0x49, 0x46, 0x38], 0);
    gif.set([0x20, 0x00, 0x30, 0x00], 6);
    const bmp = new Uint8Array(26);
    bmp.set([0x42, 0x4d], 0);
    bmp.set([0x10, 0x00, 0x00, 0x00], 18);
    bmp.set([0x18, 0x00, 0x00, 0x00], 22);
    const webp = new Uint8Array(30);
    webp.set([0x52, 0x49, 0x46, 0x46], 0);
    webp.set([0x57, 0x45, 0x42, 0x50], 8);
    webp.set([0x56, 0x50, 0x38, 0x20], 12);
    webp.set([0x40, 0x00], 26);
    webp.set([0x24, 0x00], 28);

    expect(getImageDimensions(png.buffer)).toEqual({
      height: 240,
      type: 'png',
      width: 320,
    });
    expect(getImageDimensions(jpeg)).toEqual({
      height: 32,
      type: 'jpg',
      width: 48,
    });
    expect(getImageDimensions(gif).type).toBe('gif');
    expect(getImageDimensions(bmp).type).toBe('bmp');
    expect(getImageDimensions(webp).type).toBe('webp');
    expect(getImageDimensions(new Uint8Array([1, 2, 3])).type).toBe('unknown');
  });

  it('rejects invalid and failed remote images', async () => {
    await expect(imageToBase64('javascript:alert(1)')).rejects.toThrow(
      'Invalid URL provided'
    );
    spyOn(globalThis, 'fetch').mockImplementation(
      async () => new Response(null, { status: 404, statusText: 'Not Found' })
    );
    await expect(
      imageToBase64('https://platejs.org/missing.png')
    ).rejects.toThrow('Failed to fetch image: Not Found');
  });

  it('converts fetched image bytes to base64', async () => {
    spyOn(globalThis, 'fetch').mockImplementation(
      async () => new Response(new Uint8Array([72, 105]))
    );

    await expect(imageToBase64('https://platejs.org/image.png')).resolves.toBe(
      'SGk='
    );
  });

  it.each([
    ['https://platejs.org/docs', true],
    ['http://example.com/test?q=1', true],
    ['mailto:test@example.com', false],
    ['/relative/path', false],
    ['notaurl', false],
    [undefined, false],
    [null, false],
  ])('validates %s as %p', (value, expected) => {
    expect(isValidUrl(value)).toBe(expected);
  });
});
