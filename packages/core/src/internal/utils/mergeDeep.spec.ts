import { mergeDeep } from './mergeDeep';

class Example {
  value: number;

  constructor(value: number) {
    this.value = value;
  }
}

describe('mergeDeep', () => {
  it('merges nested plain objects without mutating the target', () => {
    const target = {
      keep: true,
      nested: {
        left: 1,
        shared: { a: 'a' },
      },
    };
    const source = {
      nested: {
        right: 2,
        shared: { b: 'b' },
      },
      next: 'value',
    };

    const result = mergeDeep(target, source);

    expect(result).toEqual({
      keep: true,
      nested: {
        left: 1,
        right: 2,
        shared: { a: 'a', b: 'b' },
      },
      next: 'value',
    });
    expect(result).not.toBe(target);
    expect(result.nested).not.toBe(target.nested);
    expect(target).toEqual({
      keep: true,
      nested: {
        left: 1,
        shared: { a: 'a' },
      },
    });
  });

  it('replaces non-plain nested values instead of recursing into them', () => {
    const sourceInstance = new Example(3);

    const result = mergeDeep(
      {
        nested: new Example(1),
        plain: { left: true },
      } as any,
      {
        nested: { value: 2 },
        plain: sourceInstance,
      } as any
    );

    expect(result.nested).toEqual({ value: 2 });
    expect(result.plain).toBe(sourceInstance);
  });
});
