import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  authoredPositionAt,
  authoredPositionSpans,
  createAuthoredPositions,
  replaceAuthoredPositions,
  resolveAuthoredPosition,
} from '../src/authored/positions';
import {
  decodeAuthoredPositionRoots,
  encodeAuthoredPositionRoots,
} from '../src/authored/positions-codec';
import { readRecord, records, writeRecord } from '../src/authored/record-tree';
import type { AuthoredPositionRoots } from '../src/authored/steps';

const span = (origin: string, length = 1) => ({
  birth: null,
  length,
  offset: 0,
  origin,
  placement: null,
  properties: {},
});
const root = (origin: string) => ({
  birth: null,
  positions: createAuthoredPositions(20, origin),
  present: true,
});

describe('authored position checkpoints', () => {
  it('restores live positions and deleted-origin anchors from saved JSON', () => {
    const original = root('base');
    const inside = authoredPositionAt(original.positions, 8);
    const after = authoredPositionAt(original.positions, 16);
    const removed = replaceAuthoredPositions(original.positions, 5, 12, []);
    const positions = replaceAuthoredPositions(removed, 2, 2, [
      span('alice', 3),
    ]);
    let roots: AuthoredPositionRoots = writeRecord(null, 'main', {
      ...original,
      positions,
    });
    roots = writeRecord(roots, 'sidebar', root('side'));
    const restored = decodeAuthoredPositionRoots(
      JSON.parse(JSON.stringify(encodeAuthoredPositionRoots(roots)))
    );
    for (const [key, value] of records(roots)) {
      const loaded = readRecord(restored, key);
      assert.ok(loaded);
      assert.deepEqual(
        [
          ...authoredPositionSpans(
            loaded.positions,
            0,
            loaded.positions.root?.length ?? 0
          ),
        ],
        [
          ...authoredPositionSpans(
            value.positions,
            0,
            value.positions.root?.length ?? 0
          ),
        ]
      );
    }
    const loaded = readRecord(restored, 'main');
    assert.ok(loaded);
    assert.equal(
      resolveAuthoredPosition(loaded.positions, inside, 'right', 'collapse'),
      8
    );
    assert.equal(
      resolveAuthoredPosition(loaded.positions, after, 'right', 'collapse'),
      12
    );
    assert.equal(
      resolveAuthoredPosition(loaded.positions, inside, 'right', 'detach'),
      null
    );
  });

  it('preserves saved snapshots and untouched root identities during publication', () => {
    let roots: AuthoredPositionRoots = null;
    for (let index = 0; index < 80; index++) {
      roots = writeRecord(roots, `root-${index}`, root(`base-${index}`));
    }
    const initial = encodeAuthoredPositionRoots(roots);
    const saved = JSON.stringify(initial);
    assert.equal(encodeAuthoredPositionRoots(roots), initial);
    const previous = readRecord(roots, 'root-0');
    assert.ok(previous);
    roots = writeRecord(roots, 'root-0', {
      ...previous,
      positions: replaceAuthoredPositions(previous.positions, 4, 4, [
        span('alice'),
      ]),
    });
    const next = encodeAuthoredPositionRoots(roots);
    for (let index = 1; index < 80; index++) {
      assert.equal(
        readRecord(next, `root-${index}`),
        readRecord(initial, `root-${index}`)
      );
    }
    assert.notEqual(readRecord(next, 'root-0'), readRecord(initial, 'root-0'));
    assert.equal(JSON.stringify(initial), saved);
  });

  it('retains absent root identity and empty roots', () => {
    let roots: AuthoredPositionRoots = writeRecord(null, 'main', {
      birth: null,
      present: true,
      positions: createAuthoredPositions(0, 'base'),
    });
    roots = writeRecord(roots, 'deleted', {
      ...root('old-root'),
      birth: 'alice',
      present: false,
    });
    const restored = decodeAuthoredPositionRoots(
      JSON.parse(JSON.stringify(encodeAuthoredPositionRoots(roots)))
    );
    assert.equal(readRecord(restored, 'main')?.positions.root, null);
    assert.equal(readRecord(restored, 'deleted')?.present, false);
    assert.equal(readRecord(restored, 'deleted')?.birth, 'alice');
    assert.equal(readRecord(restored, 'deleted')?.positions.root?.length, 20);
  });

  it('continues editing after reload while preserving live and deleted anchors', () => {
    const initial = root('base');
    const deleted = authoredPositionAt(initial.positions, 7);
    const surviving = authoredPositionAt(initial.positions, 15);
    const positions = replaceAuthoredPositions(initial.positions, 5, 10, [
      span('alice', 2),
    ]);
    const saved = JSON.stringify(
      encodeAuthoredPositionRoots(
        writeRecord(null, 'main', { ...initial, positions })
      )
    );
    const loaded = readRecord(
      decodeAuthoredPositionRoots(JSON.parse(saved)),
      'main'
    );
    assert.ok(loaded);
    let current = loaded.positions;
    for (let index = 0; index < 30; index++) {
      current = replaceAuthoredPositions(current, index % 4, index % 4, [
        span(`bob-${index}`),
      ]);
    }
    assert.equal(
      resolveAuthoredPosition(current, surviving, 'right', 'detach'),
      42
    );
    assert.equal(
      resolveAuthoredPosition(current, deleted, 'right', 'collapse'),
      37
    );
    assert.equal(
      resolveAuthoredPosition(current, deleted, 'right', 'detach'),
      null
    );
    const again = readRecord(
      decodeAuthoredPositionRoots(
        JSON.parse(
          JSON.stringify(
            encodeAuthoredPositionRoots(
              writeRecord(null, 'main', { ...loaded, positions: current })
            )
          )
        )
      ),
      'main'
    );
    assert.ok(again);
    assert.deepEqual(
      [...authoredPositionSpans(again.positions)],
      [...authoredPositionSpans(current)]
    );
    assert.equal(
      resolveAuthoredPosition(loaded.positions, surviving, 'right', 'detach'),
      12
    );
  });

  for (const mutation of ['length', 'overlap', 'deletion offset'] as const) {
    it(`rejects an invalid ${mutation} without changing the source checkpoint`, () => {
      const initial = root('base');
      const positions = replaceAuthoredPositions(initial.positions, 5, 8, [
        span('alice'),
      ]);
      const checkpoint = encodeAuthoredPositionRoots(
        writeRecord(null, 'main', { ...initial, positions })
      );
      const saved = JSON.stringify(checkpoint);
      const changed = JSON.parse(saved);
      const data = changed.entries[0][1].positions;
      if (mutation === 'length') data.root.span.length = -1;
      else if (mutation === 'overlap') {
        const values: Array<{ span: ReturnType<typeof span> }> = [];
        const visit = (node: typeof data.root) => {
          if (!node) return;
          visit(node.left);
          values.push(node);
          visit(node.right);
        };
        visit(data.root);
        values[1].span = { ...values[0].span };
      } else {
        const entries = data.deleted.entries[0][1];
        entries.first = 'invalid';
        entries.entries[0][0] = 'invalid';
      }
      assert.throws(() => decodeAuthoredPositionRoots(changed));
      assert.equal(JSON.stringify(checkpoint), saved);
    });
  }
});
