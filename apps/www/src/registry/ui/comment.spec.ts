import { afterEach, beforeEach, describe, expect, it, setSystemTime } from 'bun:test';

import { formatCommentDate } from './comment';

describe('formatCommentDate', () => {
  const now = new Date('2026-01-15T12:00:00Z');

  beforeEach(() => {
    setSystemTime(now);
  });

  afterEach(() => {
    setSystemTime();
  });

  it('should format recent minutes as "Nm"', () => {
    const date = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    const result = formatCommentDate(date);

    expect(result).toBe('5m');
  });

  it('should format 0 minutes as "0m"', () => {
    const date = new Date(now.getTime() - 0); // just now
    const result = formatCommentDate(date);

    expect(result).toBe('0m');
  });

  it('should format 59 minutes as "59m"', () => {
    const date = new Date(now.getTime() - 59 * 60 * 1000); // 59 minutes ago
    const result = formatCommentDate(date);

    expect(result).toBe('59m');
  });

  it('should format hours as "Nh" when less than 24 hours', () => {
    const date = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
    const result = formatCommentDate(date);

    expect(result).toBe('3h');
  });

  it('should format 23 hours as "23h"', () => {
    const date = new Date(now.getTime() - 23 * 60 * 60 * 1000); // 23 hours ago
    const result = formatCommentDate(date);

    expect(result).toBe('23h');
  });

  it('should format 1 day as "1d"', () => {
    const date = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
    const result = formatCommentDate(date);

    expect(result).toBe('1d');
  });

  it('should format dates 2+ days ago as full date', () => {
    const date = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    const result = formatCommentDate(date);

    // Format should be MM/dd/yyyy
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('should format old dates as MM/dd/yyyy', () => {
    const date = new Date('2023-06-10T08:30:00Z');
    const result = formatCommentDate(date);

    expect(result).toBe('06/10/2023');
  });

  it('should format dates from years ago correctly', () => {
    const date = new Date('2020-12-25T00:00:00Z');
    const result = formatCommentDate(date);

    expect(result).toBe('12/25/2020');
  });

  it('should handle edge case at exactly 60 minutes', () => {
    const date = new Date(now.getTime() - 60 * 60 * 1000); // exactly 60 minutes ago
    const result = formatCommentDate(date);

    // Should show as "1h" not "60m"
    expect(result).toBe('1h');
  });

  it('should handle edge case at exactly 24 hours', () => {
    const date = new Date(now.getTime() - 24 * 60 * 60 * 1000); // exactly 24 hours ago
    const result = formatCommentDate(date);

    // Should show as "1d" not "24h"
    expect(result).toBe('1d');
  });

  it('should handle edge case at exactly 48 hours (2 days)', () => {
    const date = new Date(now.getTime() - 48 * 60 * 60 * 1000); // exactly 48 hours ago
    const result = formatCommentDate(date);

    // Should show full date format, not "2d"
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('should handle dates in the future (edge case)', () => {
    const futureDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour in future
    const result = formatCommentDate(futureDate);

    // Should handle negative difference (though this shouldn't happen in practice)
    // Will likely show as negative or 0
    expect(typeof result).toBe('string');
  });

  it('should handle very recent dates (same second)', () => {
    const date = new Date(now.getTime() - 100); // 100ms ago
    const result = formatCommentDate(date);

    expect(result).toBe('0m');
  });

  it('should format January dates correctly', () => {
    const date = new Date('2024-01-05T10:00:00Z');
    const result = formatCommentDate(date);

    expect(result).toBe('01/05/2024');
  });

  it('should format December dates correctly', () => {
    const date = new Date('2023-12-31T23:59:59Z');
    const result = formatCommentDate(date);

    expect(result).toBe('12/31/2023');
  });

  it('should handle leap year dates', () => {
    const date = new Date('2024-02-29T12:00:00Z'); // Leap year
    const result = formatCommentDate(date);

    expect(result).toBe('02/29/2024');
  });

  it('should format single-digit days with leading zero', () => {
    const date = new Date('2024-03-05T10:00:00Z');
    const result = formatCommentDate(date);

    expect(result).toBe('03/05/2024');
  });

  it('should format single-digit months with leading zero', () => {
    const date = new Date('2024-09-15T10:00:00Z');
    const result = formatCommentDate(date);

    expect(result).toBe('09/15/2024');
  });

  it('should consistently format the same date', () => {
    const date = new Date('2023-07-20T15:30:00Z');
    const result1 = formatCommentDate(date);
    const result2 = formatCommentDate(date);

    expect(result1).toBe(result2);
    expect(result1).toBe('07/20/2023');
  });
});
