import { escapeRegExp } from './escapeRegexp';

describe('escapeRegExp', () => {
  it('does not escape ordinary letters', () => {
    expect(escapeRegExp('status')).toBe('status');
  });

  it('escapes regex characters so the original string still matches exactly', () => {
    const text = 'a+b? [x] {y}.';
    const escaped = escapeRegExp(text);
    const regex = new RegExp(`^${escaped}$`);

    expect(regex.test(text)).toBe(true);
    expect(regex.test('axb? [x] {y}.')).toBe(false);
  });
});
