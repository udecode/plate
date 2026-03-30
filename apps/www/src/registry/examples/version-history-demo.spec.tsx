import type { Value } from 'platejs';

import { createVersionSnapshot } from './version-history-demo';

describe('createVersionSnapshot', () => {
  it('returns isolated snapshots for version history values', () => {
    const value: Value = [
      {
        children: [
          { text: 'This is an ' },
          { children: [{ text: '' }], type: 'inline-void' },
          { text: '. Try removing it.' },
        ],
        type: 'p',
      },
    ];

    const snapshotA = createVersionSnapshot(value);
    const snapshotB = createVersionSnapshot(value);

    expect(snapshotA).toEqual(value);
    expect(snapshotB).toEqual(value);
    expect(snapshotA).not.toBe(value);
    expect(snapshotA[0]).not.toBe(value[0]);
    expect(snapshotA[0]).not.toBe(snapshotB[0]);

    snapshotA[0].children[2] = { text: '. Changed once.' } as any;

    expect(value[0].children[2]).toEqual({ text: '. Try removing it.' });
    expect(snapshotB[0].children[2]).toEqual({ text: '. Try removing it.' });
  });
});
