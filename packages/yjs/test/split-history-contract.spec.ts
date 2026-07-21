import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getSplitHistoryCandidatePaths } from '../src/core/split-history-adapter';
import { isSplitHistory, type SplitHistory } from '../src/core/split-history';

const splitHistory = (): SplitHistory => ({
  elementPath: [0],
  elementPosition: 1,
  elementProperties: { type: 'paragraph' },
  rightText: 'beta',
  textPath: [0, 0],
  textProperties: { bold: true },
});

describe('split history contract', () => {
  it('bounds sparse structural candidates by changed-path depth', () => {
    const candidates = getSplitHistoryCandidatePaths([[99_999, 42, 7]]);

    assert.equal(candidates.length, 9);
    assert.deepEqual(candidates, [
      [99_999, 42, 7],
      [99_999, 42, 6],
      [99_999, 42, 8],
      [99_999, 42],
      [99_999, 41],
      [99_999, 43],
      [99_999],
      [99_998],
      [100_000],
    ]);
  });

  it('accepts complete split history metadata', () => {
    assert.equal(isSplitHistory(splitHistory()), true);
    assert.equal(
      isSplitHistory({
        ...splitHistory(),
        absorbedRemoteSplit: true,
        undoneWhileDisconnected: false,
      }),
      true
    );
  });

  it('rejects malformed split history metadata', () => {
    const invalid: readonly unknown[] = [
      { ...splitHistory(), absorbedRemoteSplit: 'true' },
      { ...splitHistory(), elementPath: ['0'] },
      { ...splitHistory(), elementPosition: -1 },
      { ...splitHistory(), elementPosition: Number.NaN },
      { ...splitHistory(), elementProperties: [] },
      { ...splitHistory(), textPath: [0, 0.5] },
      { ...splitHistory(), textProperties: null },
      { ...splitHistory(), undoneWhileDisconnected: 1 },
    ];

    for (const value of invalid) {
      assert.equal(isSplitHistory(value), false);
    }
  });
});
