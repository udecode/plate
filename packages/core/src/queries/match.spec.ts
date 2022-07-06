import { match } from './match';

describe('when predicate is an object', () => {
  it('should be', () => {
    const obj: any = { a: 'a', b: 'b' };
    expect(match(obj, [], { a: 'a' })).toBe(true);
    expect(match(obj, [], { a: ['a', 'b'] })).toBe(true);
    expect(match(obj, [], { a: ['c', 'b'] })).toBe(false);
    expect(match(obj, [], { a: 'a', b: 'b' })).toBe(true);
    expect(match(obj, [], { a: 'a', b: 'c' })).toBe(false);
    expect(match(obj, [], { a: 'a', b: 'b', c: 'c' } as any)).toBe(false);
    expect(match(obj, [], { c: 'c' } as any)).toBe(false);
  });
});

describe('when predicate is a function', () => {
  it('should be', () => {
    const obj: any = { a: 'a', b: 'b' };
    expect(match(obj, [], () => true)).toBe(true);
  });
});
