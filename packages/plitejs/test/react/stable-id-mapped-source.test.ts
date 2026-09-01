import { describe, expect, it } from 'vitest';

import { createStableIdMappedSource } from '../../src/react/stable-id-mapped-source';

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
  it('reuses output membership indexes when values change in one shared bucket', () => {
    const items = Array.from({ length: 1000 }, (_, index) => ({
      bucket: 'shared-bucket',
      id: `item-${index}`,
      value: index,
    }));
    const source = createSource(items);
    const before = source.getSnapshot();
    const next = items.map((item) => ({ ...item, value: -1 }));
    const NativeSet = globalThis.Set;
    let copiedMemberships = 0;
    globalThis.Set = new Proxy(NativeSet, {
      construct(target, args, constructor) {
        const input = args[0];
        if (
          Array.isArray(input) &&
          input.length > 0 &&
          input.every((key) => key === 'shared-bucket')
        ) {
          copiedMemberships += input.length;
        }
        return Reflect.construct(target, args, constructor);
      },
    });
    try {
      source.refresh(next, { changedIds: next.map((item) => item.id) });
    } finally {
      globalThis.Set = NativeSet;
    }
    expect(copiedMemberships).toBe(0);
    expect(
      source.getSnapshot().byOutputKey['shared-bucket'].map((item) => item.id)
    ).toEqual(items.map((item) => item.id));
    expect(before.byOutputKey['shared-bucket'][0].value).toBe(0);
    next[0] = { ...next[0], bucket: 'other-bucket' };
    source.refresh(next, { changedIds: [next[0].id] });
    expect(source.getSnapshot().byOutputKey['shared-bucket'][0].id).toBe(
      'item-1'
    );
    next[0] = { ...next[0], bucket: 'shared-bucket', value: 2 };
    source.refresh(next, { changedIds: [next[0].id] });
    expect(source.getSnapshot().byOutputKey['shared-bucket'][0]).toEqual({
      id: 'item-0',
      value: 2,
    });
  });

  it('preserves long prefixes, empty IDs and isolated UTF-16 surrogates', () => {
    const prefix = 'x'.repeat(4096);
    const ids = [
      '',
      '\uD800',
      '\uDC00',
      '\uD800\uDC00',
      `${prefix}a`,
      `${prefix}b`,
    ];
    const items = ids.map((id, value) => ({ bucket: id, id, value }));
    const source = createSource(items);
    const before = source.getSnapshot();
    expect([...before.byId.keys()]).toEqual(ids);
    expect(new Set(Object.keys(before.byOutputKey))).toEqual(new Set(ids));
    items[4] = { ...items[4], value: -1 };
    source.refresh(items, { changedIds: [ids[4]] });
    expect(source.getSnapshot().byId.get(ids[4])?.value).toBe(-1);
    expect(before.byId.get(ids[4])?.value).toBe(4);
    expect(source.getSnapshot().byId.get(ids[5])).toBe(before.byId.get(ids[5]));
    source.refresh(items.filter((item) => item.id !== ids[4]));
    expect(source.getSnapshot().byId.has(ids[4])).toBe(false);
    expect(source.getSnapshot().byId.get(ids[5])?.value).toBe(5);
  });

  it('bounds child-entry copies when unrelated IDs have divergent Unicode prefixes', () => {
    const items = Array.from({ length: 10_000 }, (_, index) => {
      const id = String.fromCodePoint(0x1_00_00 + index);
      return { bucket: id, id, value: index };
    });
    const source = createSource(items);
    const before = source.getWork();
    const snapshot = source.getSnapshot();
    items[0] = { ...items[0], value: -1 };
    source.refresh(items, { changedIds: [items[0].id] });
    const after = source.getWork();
    expect(
      after.snapshotChildEntryCopies - before.snapshotChildEntryCopies
    ).toBeLessThanOrEqual(4096);
    expect(source.getSnapshot().byId.get(items[0].id)?.value).toBe(-1);
    expect(snapshot.byId.get(items[0].id)?.value).toBe(0);
    expect(source.getSnapshot().byId.get(items[9999].id)).toBe(
      snapshot.byId.get(items[9999].id)
    );
    items[9999] = { ...items[9999], value: -2 };
    source.refresh(items, { changedIds: [items[9999].id] });
    expect(source.getSnapshot().byId.get(items[9999].id)?.value).toBe(-2);
    expect(snapshot.byId.get(items[9999].id)?.value).toBe(9999);
  });

  it('copies only changed entities for a trusted one-ID update', () => {
    const items = Array.from({ length: 10_000 }, (_, index) => ({
      bucket: `bucket-${index}`,
      id: `item-${index}`,
      value: index,
    }));
    const source = createSource(items);
    const before = source.getWork();
    const snapshot = source.getSnapshot();

    items[0] = { ...items[0], value: -1 };
    source.refresh(items, { changedIds: ['item-0'] });
    const after = source.getWork();

    expect(after.entityCopies - before.entityCopies).toBeLessThanOrEqual(1);
    expect(after.inputVisits - before.inputVisits).toBe(1);
    expect(snapshot.byId.get('item-0')?.value).toBe(0);
    expect(source.getSnapshot().byId.get('item-0')?.value).toBe(-1);
    expect(source.getSnapshot().byId.get('item-9999')).toBe(
      snapshot.byId.get('item-9999')
    );
  });

  it('reads unresolved IDs without visiting projected items', () => {
    const items = Array.from({ length: 10_000 }, (_, index) => ({
      bucket: `bucket-${index}`,
      id: `item-${index}`,
      value: index,
    }));
    const source = createSource(items);
    const before = source.getWork();

    expect(source.getIdsWithoutOutputs()).toEqual([]);
    expect(source.getWork().unprojectedVisits - before.unprojectedVisits).toBe(
      0
    );
  });

  it('visits affected output memberships linearly for a wide update', () => {
    const count = 1000;
    const items = Array.from({ length: count }, (_, index) => ({
      bucket: `bucket-${index}`,
      id: `item-${index}`,
      value: index,
    }));
    const source = createSource(items);
    const before = source.getWork();
    const nextItems = items.map((item) => ({ ...item, value: -1 }));
    const result = source.refresh(nextItems, {
      changedIds: items.map((item) => item.id),
    });

    expect(result.changedOutputKeys).toHaveLength(count);
    expect(
      source.getWork().outputCandidateVisits - before.outputCandidateVisits
    ).toBeLessThanOrEqual(count * 2);
    expect(
      source.getWork().snapshotNodeCopies - before.snapshotNodeCopies
    ).toBeLessThanOrEqual(count * 3 + 128);
  });

  it('preserves ordered immutable map reads for arbitrary IDs and missing entities', () => {
    const ids = ['🙂', '__proto__', '', 'ab', 'a'];
    const items = ids.map((id, value) => ({ id, value }));
    const source = createStableIdMappedSource(items, {
      getId: (item) => item.id,
      isEntityEqual: Object.is,
      isItemEqual: Object.is,
      isOutputEqual: Object.is,
      map: (item) => ({
        entity: item.value < 0 ? undefined : item.value,
        outputs: item.value < 0 ? [] : [{ key: item.id, value: item.value }],
      }),
    });
    const before = source.getSnapshot();

    expect([...before.byId.keys()]).toEqual(ids);
    expect([...before.byId.values()]).toEqual([0, 1, 2, 3, 4]);
    expect([...before.byId]).toEqual(items.map(({ id, value }) => [id, value]));
    expect(before.byId.size).toBe(5);
    expect(before.byOutputKey['🙂']).toEqual([0]);

    items[0] = { ...items[0], value: -1 };
    source.refresh(items, { changedIds: ['🙂'] });
    const absent = source.getSnapshot();

    expect(absent.byId.size).toBe(4);
    expect(absent.byId.has('🙂')).toBe(false);
    expect(absent.byOutputKey['🙂']).toBeUndefined();
    expect(source.getIdsWithoutOutputs()).toEqual(['🙂']);
    expect(before.byId.get('🙂')).toBe(0);

    items[0] = { ...items[0], value: 9 };
    source.refresh(items, { changedIds: ['🙂'] });
    const restored = source.getSnapshot();
    const visits: unknown[] = [];
    const receiver = {};

    restored.byId.forEach(function recordVisit(value, id, map) {
      visits.push([value, id, map === restored.byId, this === receiver]);
    }, receiver);

    expect(restored.byId.size).toBe(5);
    expect([...restored.byId.keys()]).toEqual(ids);
    expect(visits[0]).toEqual([9, '🙂', true, true]);
    expect(source.getIdsWithoutOutputs()).toEqual([]);
    expect(absent.byId.has('🙂')).toBe(false);
  });

  it('visits each output once when one item spans many buckets', () => {
    const count = 1000;
    let revision = 0;
    const items = [{ id: 'wide' }];
    const source = createStableIdMappedSource(items, {
      getId: (item) => item.id,
      isItemEqual: Object.is,
      isOutputEqual: Object.is,
      map: () => ({
        outputs: Array.from({ length: count }, (_, index) => ({
          key: `bucket-${index}`,
          value: revision,
        })),
      }),
    });
    const before = source.getWork();

    revision += 1;
    const result = source.refresh(items, { changedIds: ['wide'] });

    expect(result.changedOutputKeys).toHaveLength(count);
    expect(
      source.getWork().outputVisits - before.outputVisits
    ).toBeLessThanOrEqual(count * 2);
    expect(source.getSnapshot().byOutputKey['bucket-999']).toEqual([1]);
  });

  it('scans recreated inputs but maps and materializes only the changed ID', () => {
    const source = createSource([
      { bucket: 'left', id: 'a', value: 1 },
      { bucket: 'left', id: 'b', value: 2 },
      { bucket: 'right', id: 'c', value: 3 },
    ]);
    const before = source.getSnapshot();
    const unchangedEntity = before.byId.get('a');
    const unchangedBucket = before.byOutputKey.right;
    const previousChangedBucket = before.byOutputKey.left;
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
    expect(before.byOutputKey.left).toBe(previousChangedBucket);
    expect(before.byOutputKey.left).toEqual([
      { id: 'a', value: 1 },
      { id: 'b', value: 2 },
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

  it('applies a trusted keyed delta without scanning unrelated inputs', () => {
    let itemComparisons = 0;
    let mappings = 0;
    const items = Array.from({ length: 1000 }, (_, index) => ({
      bucket: `bucket-${index}`,
      id: `item-${index}`,
      value: index,
    }));
    const source = createStableIdMappedSource(items, {
      getId: (item) => item.id,
      isEntityEqual: (left, right) => left.value === right.value,
      isItemEqual: (left, right) => {
        itemComparisons += 1;

        return left.value === right.value;
      },
      isOutputEqual: (left, right) => left.value === right.value,
      map: (item) => {
        mappings += 1;

        return {
          entity: item,
          outputs: [{ key: item.bucket, value: item }],
        };
      },
    });
    const stableBucket = source.getSnapshot().byOutputKey['bucket-999'];

    itemComparisons = 0;
    mappings = 0;
    items[0] = { bucket: 'bucket-0', id: 'item-0', value: 10_000 };

    const result = source.refresh(items, { changedIds: ['item-0'] });

    expect(itemComparisons).toBe(0);
    expect(mappings).toBe(1);
    expect(result).toMatchObject({
      changedEntityIds: ['item-0'],
      changedOutputKeys: ['bucket-0'],
      fullFallback: false,
    });
    expect(source.getSnapshot().byOutputKey['bucket-999']).toBe(stableBucket);
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
          comparisonCalls += 1;
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
