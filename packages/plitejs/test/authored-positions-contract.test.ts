import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  authoredOriginSpans,
  authoredPositionAt,
  authoredPositionSpans,
  createAuthoredPositions,
  insertAuthoredPositionBatch,
  replaceAuthoredPositions,
  resolveAuthoredPosition,
  type AuthoredPosition,
  type AuthoredPositions,
  type AuthoredSpan,
} from '../src/authored/positions';
import {
  decodeAuthoredPositionRoots,
  encodeAuthoredPositionRoots,
} from '../src/authored/positions-codec';
import {
  decodeRecordTree,
  readRecord,
  records,
  removeRecord,
  writeRecord,
  type RecordTree,
} from '../src/authored/record-tree';

const assertEquivalentPositions = (
  actual: AuthoredPositions,
  expected: AuthoredPositions,
  anchors: readonly AuthoredPosition[] = []
) => {
  const spans = [...authoredPositionSpans(expected)];
  assert.deepEqual([...authoredPositionSpans(actual)], spans);
  assert.equal(actual.nodes?.count ?? 0, spans.length);
  for (let at = 0; at <= (expected.root?.length ?? 0); at++) {
    const anchor = authoredPositionAt(expected, at);
    assert.deepEqual(authoredPositionAt(actual, at), anchor);
    assert.equal(resolveAuthoredPosition(actual, anchor), at);
  }
  for (const origin of new Set(spans.map(({ span }) => span.origin))) {
    assert.deepEqual(
      authoredOriginSpans(actual, origin),
      authoredOriginSpans(expected, origin)
    );
  }
  for (const anchor of anchors) {
    for (const association of ['left', 'right'] as const) {
      for (const deletion of ['collapse', 'detach'] as const) {
        assert.equal(
          resolveAuthoredPosition(actual, anchor, association, deletion),
          resolveAuthoredPosition(expected, anchor, association, deletion)
        );
      }
    }
  }
};

describe('authored durable positions', () => {
  it('batches insertions while preserving origin fragments, properties and deleted anchors', () => {
    const spans: AuthoredSpan[] = [
      {
        birth: 'shared-change',
        length: 4,
        offset: 10,
        origin: 'shared',
        placement: 'move',
        properties: { bold: 'format' },
      },
      {
        birth: null,
        length: 8,
        offset: 0,
        origin: 'other',
        placement: null,
        properties: {},
      },
      {
        birth: 'shared-change',
        length: 6,
        offset: 0,
        origin: 'shared',
        placement: null,
        properties: { italic: 'format' },
      },
      {
        birth: null,
        length: 10,
        offset: 0,
        origin: 'last',
        placement: null,
        properties: {},
      },
    ];
    const original = replaceAuthoredPositions(
      createAuthoredPositions(0, ''),
      0,
      0,
      spans
    );
    const anchors = Array.from({ length: 29 }, (_, at) =>
      authoredPositionAt(original, at)
    );
    const before = replaceAuthoredPositions(original, 5, 9, []);
    const saved = JSON.stringify(before);
    const insertions = [0, 2, 4, 5, 7, 9, 12, 15, 18, 22, 24].map(
      (at, index) => ({
        at,
        spans: [
          {
            birth: `change-${index}`,
            length: 2,
            offset: 5,
            origin: `insertion-${index}`,
            placement: `placement-${index}`,
            properties: { bold: `format-${index}` },
          },
          {
            birth: `change-${index}`,
            length: 1,
            offset: 0,
            origin: `insertion-${index}`,
            placement: null,
            properties: {},
          },
        ],
      })
    );
    let expected = before;
    for (const { at, spans: inserted } of insertions.toReversed()) {
      expected = replaceAuthoredPositions(expected, at, at, inserted);
    }
    const actual = insertAuthoredPositionBatch(before, insertions);
    assert.equal(actual.deleted, before.deleted);
    assertEquivalentPositions(actual, expected, anchors);
    const checkpoint = encodeAuthoredPositionRoots(
      writeRecord(null, 'main', {
        birth: null,
        present: true,
        positions: actual,
      })
    );
    const loaded = readRecord(
      decodeAuthoredPositionRoots(JSON.parse(JSON.stringify(checkpoint))),
      'main'
    );
    assert.ok(loaded);
    assertEquivalentPositions(loaded.positions, expected, anchors);
    const replacement = [{ ...spans[1], origin: 'continued', length: 3 }];
    assertEquivalentPositions(
      replaceAuthoredPositions(loaded.positions, 3, 11, replacement),
      replaceAuthoredPositions(expected, 3, 11, replacement),
      anchors
    );
    assert.equal(JSON.stringify(before), saved);
  });

  it('handles empty input, document boundaries and sparse insertion batches', () => {
    const empty = createAuthoredPositions(0, 'empty');
    const span = (origin: string): AuthoredSpan => ({
      birth: origin,
      length: 2,
      offset: 0,
      origin,
      placement: null,
      properties: {},
    });
    assert.equal(insertAuthoredPositionBatch(empty, []), empty);
    const first = insertAuthoredPositionBatch(empty, [
      { at: 0, spans: [span('first')] },
    ]);
    assertEquivalentPositions(
      first,
      replaceAuthoredPositions(empty, 0, 0, [span('first')])
    );
    const fragments = Array.from({ length: 24 }, (_, index) =>
      span(`base-${index}`)
    );
    const before = replaceAuthoredPositions(empty, 0, 0, fragments);
    const insertions = [
      { at: 0, spans: [span('start')] },
      { at: 48, spans: [span('end')] },
    ];
    const anchors = Array.from({ length: 49 }, (_, at) =>
      authoredPositionAt(before, at)
    );
    assert.equal(insertAuthoredPositionBatch(before, []), before);
    assertEquivalentPositions(
      insertAuthoredPositionBatch(before, insertions),
      replaceAuthoredPositions(
        replaceAuthoredPositions(before, 48, 48, insertions[1].spans),
        0,
        0,
        insertions[0].spans
      ),
      anchors
    );
  });

  it('preserves identities across interior edits and independent surrounding content', () => {
    const base = createAuthoredPositions(20, 'base');
    const point = authoredPositionAt(base, 8);
    let current = replaceAuthoredPositions(base, 3, 3, [
      {
        birth: 'alice',
        length: 5,
        offset: 0,
        origin: 'alice-op',
        placement: null,
        properties: {},
      },
    ]);
    assert.equal(resolveAuthoredPosition(current, point), 13);
    const pending = authoredPositionAt(current, 5);
    current = replaceAuthoredPositions(current, 0, 2, []);
    assert.equal(resolveAuthoredPosition(current, point), 11);
    assert.equal(resolveAuthoredPosition(current, pending), 3);
    assert.equal(resolveAuthoredPosition(base, point), 8);
    current = replaceAuthoredPositions(current, 1, 6, []);
    assert.equal(resolveAuthoredPosition(current, pending), null);
    assert.equal(resolveAuthoredPosition(current, point), 6);
  });

  it('keeps token origins, inverse lookup and prior snapshots exact through repeated splits and deletions', () => {
    let current = createAuthoredPositions(40, 'base');
    const oracle = Array.from({ length: 40 }, (_, offset) => ({
      origin: 'base',
      offset,
    }));
    let randomState = 7;
    const random = () =>
      (randomState =
        (Math.imul(randomState, 1_664_525) + 1_013_904_223) >>> 0) /
      2 ** 32;
    for (let revision = 0; revision < 1500; revision++) {
      const before = current;
      const beforeLength = oracle.length;
      const from = Math.floor(random() * (oracle.length + 1));
      const to = Math.min(oracle.length, from + Math.floor(random() * 6));
      const length = 1 + Math.floor(random() * 6);
      const origin = `operation-${revision}`;
      current = replaceAuthoredPositions(current, from, to, [
        {
          birth: `change-${revision}`,
          length,
          offset: 0,
          origin,
          placement: null,
          properties: {},
        },
      ]);
      oracle.splice(
        from,
        to - from,
        ...Array.from({ length }, (_, offset) => ({ origin, offset }))
      );
      assert.equal(before.root?.length ?? 0, beforeLength);
      assert.equal(current.root?.length ?? 0, oracle.length);
      if (revision % 25) continue;
      const actual = [...authoredPositionSpans(current)];
      assert.equal([...records(current.nodes)].length, actual.length);
      assert.deepEqual(
        actual.flatMap(({ span }) =>
          Array.from({ length: span.length }, (_, offset) => ({
            origin: span.origin,
            offset: span.offset + offset,
          }))
        ),
        oracle
      );
      for (let position = 0; position <= oracle.length; position++) {
        assert.equal(
          resolveAuthoredPosition(
            current,
            authoredPositionAt(current, position)
          ),
          position
        );
      }
      for (const identity of new Set(oracle.map((token) => token.origin))) {
        const found = authoredOriginSpans(current, identity).flatMap(
          ({ from: start, span }) =>
            Array.from({ length: span.length }, (_, offset) => start + offset)
        );
        assert.deepEqual(
          found,
          oracle.flatMap((token, index) =>
            token.origin === identity ? [index] : []
          )
        );
      }
    }
  });

  it('retains ordered checkpoint records through full deletion and reload', () => {
    let tree: RecordTree<number> | null = null;
    const keys = Array.from({ length: 3000 }, (_, index) =>
      String(index).padStart(5, '0')
    );
    for (const key of keys) tree = writeRecord(tree, key, Number(key));
    const initial = tree;
    const expected = new Map(keys.map((key) => [key, Number(key)]));
    for (let i = 0; i < keys.length; i++) {
      const index = i % 2 ? (i - 1) / 2 : keys.length - 1 - i / 2;
      const key = keys[index];
      tree = removeRecord(tree, key);
      expected.delete(key);
      assert.equal(readRecord(tree, key), null);
      if (i % 100) continue;
      tree = decodeRecordTree(JSON.parse(JSON.stringify(tree)), (value) => {
        assert.equal(typeof value, 'number');
        return Number(value);
      });
      assert.deepEqual([...records(tree)], [...expected]);
    }
    assert.equal(tree, null);
    assert.equal([...records(initial)].length, keys.length);
  });
});
