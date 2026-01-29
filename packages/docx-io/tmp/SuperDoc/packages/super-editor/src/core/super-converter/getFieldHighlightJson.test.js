import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getFieldHighlightJson } from './exporter.js';

const extractFill = (result) => result?.elements?.[0]?.attributes?.['w:fill'];

describe('getFieldHighlightJson (non-throwing)', () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('returns null for falsy inputs (undefined, null, empty string)', () => {
    expect(getFieldHighlightJson()).toBeNull();
    expect(getFieldHighlightJson(undefined)).toBeNull();
    expect(getFieldHighlightJson(null)).toBeNull();
    expect(getFieldHighlightJson('')).toBeNull();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('accepts 3/4/6/8-digit HEX with or without # (case preserved)', () => {
    const cases = [
      ['#FFF', '#FFF'],
      ['FFF', '#FFF'],
      ['#ffff', '#ffff'],
      ['FFFF', '#FFFF'],
      ['#A1B2C3', '#A1B2C3'],
      ['a1b2c3', '#a1b2c3'],
      ['#A1B2C3D4', '#A1B2C3D4'],
      ['a1b2c3d4', '#a1b2c3d4'],
    ];

    for (const [input, expectedFill] of cases) {
      const out = getFieldHighlightJson(input);
      expect(out).toBeTruthy();
      expect(out.name).toBe('w:rPr');
      expect(extractFill(out)).toBe(expectedFill);
      expect(out.elements[0].attributes['w:color']).toBe('auto');
      expect(out.elements[0].attributes['w:val']).toBe('clear');
    }
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('trims surrounding whitespace and still validates', () => {
    const out1 = getFieldHighlightJson('   #ABCDEF   ');
    expect(extractFill(out1)).toBe('#ABCDEF');

    const out2 = getFieldHighlightJson('   abc   ');
    expect(extractFill(out2)).toBe('#abc');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('treats pure whitespace as invalid (returns null and warns)', () => {
    const out = getFieldHighlightJson('   ');
    expect(out).toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/Invalid HEX color/i);
  });

  it('returns null and warns for invalid HEX formats', () => {
    const invalid = [
      '#GGG',
      'GGGZ',
      'red',
      '12345',
      '#12345',
      '#1234567',
      '1234567',
      '#',
      '##123',
      'xyz',
      '#ffffgfff',
      '12',
      '#12',
    ];

    for (const input of invalid) {
      const out = getFieldHighlightJson(input);
      expect(out).toBeNull();
    }
    expect(warnSpy).toHaveBeenCalledTimes(invalid.length);
    for (let i = 0; i < invalid.length; i++) {
      expect(warnSpy.mock.calls[i][0]).toMatch(/Invalid HEX color/i);
    }
  });

  it('adds a leading # when missing', () => {
    const out = getFieldHighlightJson('ABCDEF');
    expect(extractFill(out)).toBe('#ABCDEF');
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
