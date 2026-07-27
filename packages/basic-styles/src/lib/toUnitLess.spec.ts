import { toUnitLess } from './toUnitLess';

describe('toUnitLess', () => {
  it('returns 0 for invalid values', () => {
    expect(toUnitLess('')).toBe('0');
    expect(toUnitLess('auto')).toBe('0');
  });

  it('keeps numeric values unitless', () => {
    expect(toUnitLess('24')).toBe('24');
    expect(toUnitLess('24px')).toBe('24');
  });

  it('converts rem values using a 16px base', () => {
    expect(toUnitLess('2rem')).toBe('32');
  });
});
