import { describe, expect, it } from 'vitest';

import { createStableIdMappedSource } from '../src/stable-id-mapped-source';

type Item = Readonly<{
  bucket: string;
  id: string;
  value: number;
}>;

const createSource = (items: readonly Item[], getOffset = () => 0) =>
  createStableIdMappedSource<
    Item,
    Readonly<{ id: string; value: number }>,
    Readonly<{ id: string; value: number }>
  >(items, {
    getId: (item) => item.id,
    isEntityEqual: (left, right) =>
      left.id === right.id && left.value === right.value,
    isItemEqual: (left, right) =>
      left.id === right.id &&
      left.bucket === right.bucket &&
      left.value === right.value,
    isOutputEqual: (left, right) =>
      left.id === right.id && left.value === right.value,
    map: (item) => ({
      entity: Object.freeze({
        id: item.id,
        value: item.value + getOffset(),
      }),
      outputs: [
        {
          key: item.bucket,
          value: Object.freeze({
            id: item.id,
            value: item.value + getOffset(),
          }),
        },
      ],
    }),
  });

describe('stable ID mapped source', () => {
  it('scans recreated inputs but maps and materializes only the changed ID', () => {
    const source = createSource([
      { bucket: 'left', id: 'a', value: 1 },
      { bucket: 'left', id: 'b', value: 2 },
      { bucket: 'right', id: 'c', value: 3 },
    ]);
    const before = source.getSnapshot();
    const unchangedEntity = before.byId.get('a');
    const unchangedBucket = before.byOutputKey.right;
    const result = source.refresh([
      { bucket: 'left', id: 'a', value: 1 },
      { bucket: 'left', id: 'b', value: 20 },
      { bucket: 'right', id: 'c', value: 3 },
    ]);
    const after = source.getSnapshot();

    expect(result).toMatchObject({
      changedEntityIds: ['b'],
      changedOutputKeys: ['left'],
      fullFallback: false,
      orderChanged: false,
    });
    expect(result.mapped.map(({ id }) => id)).toEqual(['b']);
    expect(after.byId.get('a')).toBe(unchangedEntity);
    expect(after.byOutputKey.right).toBe(unchangedBucket);
    expect(after.byOutputKey.left).toEqual([
      { id: 'a', value: 1 },
      { id: 'b', value: 20 },
    ]);
  });

  it('force-maps context-dependent IDs without rebuilding unrelated buckets', () => {
    let offset = 0;
    const items = [
      { bucket: 'left', id: 'a', value: 1 },
      { bucket: 'right', id: 'b', value: 2 },
    ] as const;
    const source = createSource(items, () => offset);
    const rightBucket = source.getSnapshot().byOutputKey.right;

    offset = 5;
    const result = source.refresh(items, { forceIds: ['a'] });

    expect(result.changedEntityIds).toEqual(['a']);
    expect(result.changedOutputKeys).toEqual(['left']);
    expect(source.getSnapshot().byId.get('a')?.value).toBe(6);
    expect(source.getSnapshot().byOutputKey.right).toBe(rightBucket);
  });

  it('uses a traced full fallback for source order changes', () => {
    const source = createSource([
      { bucket: 'same', id: 'a', value: 1 },
      { bucket: 'same', id: 'b', value: 2 },
    ]);
    const result = source.refresh([
      { bucket: 'same', id: 'b', value: 2 },
      { bucket: 'same', id: 'a', value: 1 },
    ]);

    expect(result.fullFallback).toBe(true);
    expect(result.orderChanged).toBe(true);
    expect(result.changedOutputKeys).toEqual(['same']);
    expect(source.getSnapshot().allIds).toEqual(['b', 'a']);
  });

  it('leaves the published snapshot intact when mapping throws', () => {
    let shouldThrow = false;
    const items = [{ bucket: 'left', id: 'a', value: 1 }] as const;
    const source = createStableIdMappedSource(items, {
      getId: (item) => item.id,
      isEntityEqual: Object.is,
      isItemEqual: (left, right) => left.value === right.value,
      isOutputEqual: Object.is,
      map: (item) => {
        if (shouldThrow) throw new Error('map failed');

        return { entity: item, outputs: [] };
      },
    });
    const before = source.getSnapshot();

    shouldThrow = true;

    expect(() =>
      source.refresh([{ bucket: 'left', id: 'a', value: 2 }])
    ).toThrow('map failed');
    expect(source.getSnapshot().allIds).toBe(before.allIds);
    expect(source.getSnapshot().byId).toBe(before.byId);
    expect(source.getSnapshot().byId.get('a')?.value).toBe(1);
  });

  it('leaves inputs and reverse indexes intact when comparison throws', () => {
    let comparisonCalls = 0;
    let shouldThrow = false;
    const source = createStableIdMappedSource(
      [{ bucket: 'left', id: 'a', value: 1 }],
      {
        getId: (item) => item.id,
        isEntityEqual: (left, right) => left.value === right.value,
        isItemEqual: (left, right) => left.value === right.value,
        isOutputEqual: (left, right) => {
          comparisonCalls++;
          if (shouldThrow && comparisonCalls === 1) {
            throw new Error('comparison failed');
          }

          return left.value === right.value;
        },
        map: (item) => ({
          entity: item,
          outputs: [
            { key: 'stable', value: item },
            { key: item.bucket, value: item },
          ],
        }),
      }
    );
    const before = source.getSnapshot();
    const nextItems = [{ bucket: 'right', id: 'a', value: 2 }];

    shouldThrow = true;

    expect(() => source.refresh(nextItems)).toThrow('comparison failed');
    expect(source.getSnapshot().byId).toBe(before.byId);
    expect(source.getSnapshot().byOutputKey).toBe(before.byOutputKey);
    expect(source.getIdsForOutputKeys(['left'])).toEqual(['a']);
    expect(source.getIdsForOutputKeys(['right'])).toEqual([]);

    shouldThrow = false;
    comparisonCalls = 0;

    expect(source.refresh(nextItems)).toMatchObject({
      changedEntityIds: ['a'],
      changedOutputKeys: ['stable', 'left', 'right'],
    });
  });

  it('rejects duplicate stable IDs', () => {
    expect(() =>
      createSource([
        { bucket: 'left', id: 'a', value: 1 },
        { bucket: 'right', id: 'a', value: 2 },
      ])
    ).toThrow('Stable mapped view source IDs must be unique.');
  });
});
