/**
 * Tests for parsing helper functions
 */

import {
  safeParseInt,
  parseOoxmlBoolean,
  isExplicitlySet,
  parseNumericAttribute,
  parseOnOffAttribute,
} from '../../src/utils/parsingHelpers';

describe('parsingHelpers', () => {
  describe('safeParseInt', () => {
    it('should parse valid integer strings', () => {
      expect(safeParseInt('42')).toBe(42);
      expect(safeParseInt('0')).toBe(0);
      expect(safeParseInt('-10')).toBe(-10);
      expect(safeParseInt('100')).toBe(100);
    });

    it('should handle numeric input', () => {
      expect(safeParseInt(42)).toBe(42);
      expect(safeParseInt(0)).toBe(0);
      expect(safeParseInt(-10)).toBe(-10);
      expect(safeParseInt(3.7)).toBe(3); // Floor for non-integers
    });

    it('should return default for undefined/null', () => {
      expect(safeParseInt(undefined)).toBe(0);
      expect(safeParseInt(null)).toBe(0);
      expect(safeParseInt(undefined, 100)).toBe(100);
      expect(safeParseInt(null, 50)).toBe(50);
    });

    it('should return default for invalid strings', () => {
      expect(safeParseInt('invalid')).toBe(0);
      expect(safeParseInt('')).toBe(0);
      expect(safeParseInt('abc', 99)).toBe(99);
    });

    it('should return default for NaN input', () => {
      expect(safeParseInt(Number.NaN)).toBe(0);
      expect(safeParseInt(Number.NaN, 42)).toBe(42);
    });

    it('should handle zero correctly (not as falsy)', () => {
      expect(safeParseInt('0')).toBe(0);
      expect(safeParseInt(0)).toBe(0);
      // This is the key fix - 0 should NOT trigger default
      expect(safeParseInt('0', 999)).toBe(0);
    });
  });

  describe('parseOoxmlBoolean', () => {
    it('should return false for absent element', () => {
      expect(parseOoxmlBoolean(undefined)).toBe(false);
      expect(parseOoxmlBoolean(null)).toBe(false);
      expect(parseOoxmlBoolean(false)).toBe(false);
    });

    it('should return true for self-closing element without w:val', () => {
      // <w:bold/> without any attributes
      expect(parseOoxmlBoolean({})).toBe(true);
      expect(parseOoxmlBoolean({ otherAttr: 'value' })).toBe(true);
    });

    it('should return true for explicit true values', () => {
      expect(parseOoxmlBoolean({ '@_w:val': '1' })).toBe(true);
      expect(parseOoxmlBoolean({ '@_w:val': 1 })).toBe(true);
      expect(parseOoxmlBoolean({ '@_w:val': 'true' })).toBe(true);
      expect(parseOoxmlBoolean({ '@_w:val': true })).toBe(true);
      expect(parseOoxmlBoolean({ '@_w:val': 'on' })).toBe(true);
    });

    it('should return false for explicit false values', () => {
      expect(parseOoxmlBoolean({ '@_w:val': '0' })).toBe(false);
      expect(parseOoxmlBoolean({ '@_w:val': 0 })).toBe(false);
      expect(parseOoxmlBoolean({ '@_w:val': 'false' })).toBe(false);
      expect(parseOoxmlBoolean({ '@_w:val': false })).toBe(false);
      expect(parseOoxmlBoolean({ '@_w:val': 'off' })).toBe(false);
    });

    it('should handle case variations', () => {
      expect(parseOoxmlBoolean({ '@_w:val': 'TRUE' })).toBe(true);
      expect(parseOoxmlBoolean({ '@_w:val': 'False' })).toBe(false);
      expect(parseOoxmlBoolean({ '@_w:val': 'ON' })).toBe(true);
    });
  });

  describe('isExplicitlySet', () => {
    it('should return true for explicitly set values', () => {
      expect(isExplicitlySet(0)).toBe(true);
      expect(isExplicitlySet('')).toBe(true);
      expect(isExplicitlySet(false)).toBe(true);
      expect(isExplicitlySet('value')).toBe(true);
      expect(isExplicitlySet(42)).toBe(true);
      expect(isExplicitlySet({})).toBe(true);
      expect(isExplicitlySet([])).toBe(true);
    });

    it('should return false for undefined/null', () => {
      expect(isExplicitlySet(undefined)).toBe(false);
      expect(isExplicitlySet(null)).toBe(false);
    });

    it('should correctly handle zero (the main fix)', () => {
      // This is the critical test - 0 should be considered explicitly set
      expect(isExplicitlySet(0)).toBe(true);
      expect(isExplicitlySet('0')).toBe(true);
    });
  });

  describe('parseNumericAttribute', () => {
    it('should parse valid values', () => {
      expect(parseNumericAttribute('100', 50)).toBe(100);
      expect(parseNumericAttribute(42, 10)).toBe(42);
    });

    it('should return default for undefined/null', () => {
      expect(parseNumericAttribute(undefined, 50)).toBe(50);
      expect(parseNumericAttribute(null, 50)).toBe(50);
    });

    it('should return default for invalid values', () => {
      expect(parseNumericAttribute('invalid', 50)).toBe(50);
      expect(parseNumericAttribute(Number.NaN, 50)).toBe(50);
    });

    it('should preserve zero values', () => {
      // Zero should NOT trigger default
      expect(parseNumericAttribute('0', 50)).toBe(0);
      expect(parseNumericAttribute(0, 50)).toBe(0);
    });
  });

  describe('parseOnOffAttribute', () => {
    it('should return true for on values', () => {
      expect(parseOnOffAttribute('1')).toBe(true);
      expect(parseOnOffAttribute(1)).toBe(true);
      expect(parseOnOffAttribute('true')).toBe(true);
      expect(parseOnOffAttribute(true)).toBe(true);
      expect(parseOnOffAttribute('on')).toBe(true);
    });

    it('should return false for off values', () => {
      expect(parseOnOffAttribute('0')).toBe(false);
      expect(parseOnOffAttribute(0)).toBe(false);
      expect(parseOnOffAttribute('false')).toBe(false);
      expect(parseOnOffAttribute(false)).toBe(false);
      expect(parseOnOffAttribute('off')).toBe(false);
    });

    it('should return default for undefined/null', () => {
      expect(parseOnOffAttribute(undefined)).toBe(false);
      expect(parseOnOffAttribute(null)).toBe(false);
      expect(parseOnOffAttribute(undefined, true)).toBe(true);
      expect(parseOnOffAttribute(null, true)).toBe(true);
    });
  });
});
