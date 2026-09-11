import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  authoredOriginSpans,
  authoredPositionAt,
  authoredPositionSpans,
  createAuthoredPositions,
  replaceAuthoredPositions,
  resolveAuthoredPosition,
} from '../src/authored/positions';
import {
  decodeRecordTree,
  readRecord,
  records,
  removeRecord,
  writeRecord,
  type RecordTree,
} from '../src/authored/record-tree';

describe('authored durable positions', () => {
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
