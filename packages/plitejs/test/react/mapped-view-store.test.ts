import { runInNewContext } from 'node:vm';

import { areMappedViewDataEqual } from '../../src/react/mapped-view-store';

test('mapped view data compares canonical JSON across realms and key order', () => {
  const foreignData = runInNewContext(`(() => {
    const shared = { labels: ['one', 'two'] };

    return {
      nested: {
        right: shared,
        left: shared,
      },
      count: 2,
    };
  })()`) as {
    count: number;
    nested: {
      left: { labels: string[] };
      right: { labels: string[] };
    };
  };
  const localData = {
    count: 2,
    nested: {
      left: { labels: ['one', 'two'] },
      right: { labels: ['one', 'two'] },
    },
  };

  expect(areMappedViewDataEqual(foreignData, localData)).toBe(true);
  expect(
    areMappedViewDataEqual(foreignData, {
      ...localData,
      nested: {
        ...localData.nested,
        right: { labels: ['one', 'changed'] },
      },
    })
  ).toBe(false);
});

test('mapped view data keeps non-JSON and cyclic values reference-only', () => {
  class Metadata {
    value = 1;
  }

  const classValue = new Metadata();
  const cyclicValue: Record<string, unknown> = {};
  const otherCycle: Record<string, unknown> = {};

  cyclicValue.self = cyclicValue;
  otherCycle.self = otherCycle;

  expect(areMappedViewDataEqual(classValue, classValue)).toBe(true);
  expect(areMappedViewDataEqual(classValue, new Metadata())).toBe(false);
  expect(areMappedViewDataEqual(cyclicValue, cyclicValue)).toBe(true);
  expect(areMappedViewDataEqual(cyclicValue, otherCycle)).toBe(false);
  expect(
    areMappedViewDataEqual({ value: classValue }, { value: classValue })
  ).toBe(false);
});

test('mapped view data rejects accessors without executing them', () => {
  let reads = 0;
  const accessorData = {};

  Object.defineProperty(accessorData, 'value', {
    enumerable: true,
    get() {
      reads += 1;

      return 1;
    },
  });

  expect(areMappedViewDataEqual(accessorData, { value: 1 })).toBe(false);
  expect(reads).toBe(0);
});
