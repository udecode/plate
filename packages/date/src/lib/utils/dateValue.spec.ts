import {
  formatDateValue,
  getDateDisplayLabel,
  normalizeDateValue,
  parseCanonicalDateValue,
} from './dateValue';

describe('dateValue helpers', () => {
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

  it('normalizes legacy toDateString values into canonical dates', () => {
    expect(normalizeDateValue('Mon Mar 23 2026')).toEqual({
      date: '2026-03-23',
    });
  });

  it('preserves non-normalizable legacy text as raw fallback data', () => {
    expect(normalizeDateValue('sometime next week')).toEqual({
      rawDate: 'sometime next week',
    });
  });

  it('renders canonical values as relative labels when applicable', () => {
    const now = new Date(2026, 2, 23, 9, 0);

    expect(getDateDisplayLabel({ date: '2026-03-23', now })).toBe('Today');
    expect(getDateDisplayLabel({ date: '2026-03-22', now })).toBe('Yesterday');
    expect(getDateDisplayLabel({ date: '2026-03-24', now })).toBe('Tomorrow');
  });

  it('renders raw fallback text literally', () => {
    expect(getDateDisplayLabel({ rawDate: 'sometime next week' })).toBe(
      'sometime next week'
    );
  });
});
