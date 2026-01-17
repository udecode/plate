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
} from './color-conversion';

describe('color conversion', () => {
  describe('regex patterns', () => {
    it('rgbRegex should match RGB values', () => {
      expect(rgbRegex.test('rgb(255, 0, 0)')).toBe(true);
      expect(rgbRegex.test('rgb(0,0,0)')).toBe(true); // space after comma is optional
      expect(rgbRegex.test('rgb(128, 128, 128)')).toBe(true);
      expect(rgbRegex.test('#FF0000')).toBe(false);
    });

    it('hslRegex should match HSL values', () => {
      expect(hslRegex.test('hsl(0, 100%, 50%)')).toBe(true);
      expect(hslRegex.test('hsl(120, 50%, 50%)')).toBe(true);
      expect(hslRegex.test('rgb(255, 0, 0)')).toBe(false);
    });

    it('hexRegex should match 6-digit hex values', () => {
      expect(hexRegex.test('#FF0000')).toBe(true);
      expect(hexRegex.test('#ffffff')).toBe(true);
      expect(hexRegex.test('#123456')).toBe(true);
    });

    it('hex3Regex should match 3-digit hex patterns', () => {
      expect(hex3Regex.test('#F00')).toBe(true);
      expect(hex3Regex.test('#fff')).toBe(true);
      expect(hex3Regex.test('#123')).toBe(true);
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB black to hex', () => {
      expect(rgbToHex(0, 0, 0)).toBe('000000');
    });

    it('should convert RGB white to hex', () => {
      expect(rgbToHex(255, 255, 255)).toBe('ffffff');
    });

    it('should convert RGB red to hex', () => {
      expect(rgbToHex(255, 0, 0)).toBe('ff0000');
    });

    it('should convert RGB green to hex', () => {
      expect(rgbToHex(0, 255, 0)).toBe('00ff00');
    });

    it('should convert RGB blue to hex', () => {
      expect(rgbToHex(0, 0, 255)).toBe('0000ff');
    });

    it('should convert mixed RGB values', () => {
      expect(rgbToHex(128, 64, 32)).toBe('804020');
    });

    it('should handle string inputs', () => {
      expect(rgbToHex('255', '128', '0')).toBe('ff8000');
    });
  });

  describe('hslToHex', () => {
    it('should convert HSL red to hex', () => {
      const result = hslToHex(0, 100, 50);
      expect(result.toLowerCase()).toBe('ff0000');
    });

    it('should convert HSL green to hex', () => {
      const result = hslToHex(120, 100, 50);
      expect(result.toLowerCase()).toBe('00ff00');
    });

    it('should convert HSL blue to hex', () => {
      const result = hslToHex(240, 100, 50);
      expect(result.toLowerCase()).toBe('0000ff');
    });

    it('should convert HSL black to hex', () => {
      const result = hslToHex(0, 0, 0);
      expect(result.toLowerCase()).toBe('000000');
    });

    it('should convert HSL white to hex', () => {
      const result = hslToHex(0, 0, 100);
      expect(result.toLowerCase()).toBe('ffffff');
    });

    it('should convert HSL gray to hex', () => {
      const result = hslToHex(0, 0, 50);
      // Gray should be around 808080
      expect(result.toLowerCase()).toMatch(
        /^[78][0-9a-f][78][0-9a-f][78][0-9a-f]$/
      );
    });
  });

  describe('hex3ToHex', () => {
    it('should expand F, 0, 0 to FF0000', () => {
      expect(hex3ToHex('F', '0', '0')).toBe('FF0000');
    });

    it('should expand 0, F, 0 to 00FF00', () => {
      expect(hex3ToHex('0', 'F', '0')).toBe('00FF00');
    });

    it('should expand 0, 0, F to 0000FF', () => {
      expect(hex3ToHex('0', '0', 'F')).toBe('0000FF');
    });

    it('should expand F, F, F to FFFFFF', () => {
      expect(hex3ToHex('F', 'F', 'F')).toBe('FFFFFF');
    });

    it('should expand 0, 0, 0 to 000000', () => {
      expect(hex3ToHex('0', '0', '0')).toBe('000000');
    });

    it('should expand lowercase a, b, c to aabbcc', () => {
      expect(hex3ToHex('a', 'b', 'c')).toBe('aabbcc');
    });

    it('should expand 1, 2, 3 to 112233', () => {
      expect(hex3ToHex('1', '2', '3')).toBe('112233');
    });
  });
});
