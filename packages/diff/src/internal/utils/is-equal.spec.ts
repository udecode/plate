import { isEqual } from './is-equal';

describe('isEqual', () => {
  it('returns true for equal objects', () => {
    const a = { x: { y: 5 } };
    const b = { x: { y: 5 } };
    const result = isEqual(a, b);
    expect(result).toBeTruthy();
  });

  it('returns false for inequal objects', () => {
    const a = { x: { y: 5 } };
    const b = { x: { y: 6 } };
    const result = isEqual(a, b);
    expect(result).toBeFalsy();
  });

  it('ignores deeply ignored keys', () => {
    const a = { ignore: 3, x: [{ ignore: 1, y: 5 }] };
    const b = { ignore: 4, x: [{ ignore: 2, y: 5 }] };
    const result = isEqual(a, b, { ignoreDeep: ['ignore'] });
    expect(result).toBeTruthy();
  });

  it('ignores shallowly ignored keys', () => {
    const a = { ignore: 3, x: { ignore: 1, y: 5 } };
    const b = { ignore: 4, x: { ignore: 1, y: 5 } };
    const result = isEqual(a, b, { ignoreShallow: ['ignore'] });
    expect(result).toBeTruthy();
  });

  it('does not ignore shallowly ignored keys deeply', () => {
    const a = { ignore: 3, x: { ignore: 1, y: 5 } };
    const b = { ignore: 4, x: { ignore: 2, y: 5 } };
    const result = isEqual(a, b, { ignoreShallow: ['ignore'] });
    expect(result).toBeFalsy();
  });

  it('returns false when comparing arrays and non-arrays', () => {
    const a = { x: { y: 5 } };
    const b = [{ x: { y: 5 } }];
    const result = isEqual(a, b);
    expect(result).toBeFalsy();
  });
});
