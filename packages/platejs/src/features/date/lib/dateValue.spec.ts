import { formatDateValue, parseCanonicalDateValue } from './dateValue';

describe('date values', () => {
  it('formats dates as canonical calendar-day strings', () => {
    expect(formatDateValue(new Date(2026, 2, 23, 8, 15))).toBe('2026-03-23');
  });

  it('parses canonical date values without timezone drift', () => {
    const parsed = parseCanonicalDateValue('2026-03-23');

    expect(parsed).toBeDefined();
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(2);
    expect(parsed?.getDate()).toBe(23);
    expect(parsed?.getHours()).toBe(12);
  });
});
