import type { Value } from 'platejs';

import {
  createVersionSnapshot,
  formatPropertyValue,
} from './version-history-demo';

describe('formatPropertyValue', () => {
  it('keeps strings readable and serializes structured JSON values', () => {
    expect(formatPropertyValue('draft')).toBe('draft');
    expect(formatPropertyValue({ nested: ['draft', 2] })).toBe(
      '{"nested":["draft",2]}'
    );
    expect(formatPropertyValue(undefined)).toBe('undefined');
  });
});

describe('createVersionSnapshot', () => {
  it('returns isolated snapshots for version history values', () => {
    const value: Value = [
      {
        children: [
          { text: 'This is an ' },
          { children: [{ text: '' }], type: 'inline-void' },
          { text: '. Try removing it.' },
        ],
        type: 'paragraph',
      },
    ];

    const snapshotA = createVersionSnapshot(value);
    const snapshotB = createVersionSnapshot(value);

    expect(snapshotA).toEqual(value);
    expect(snapshotB).toEqual(value);
    expect(snapshotA).not.toBe(value);
    expect(snapshotA[0]).not.toBe(value[0]);
    expect(snapshotA[0]).not.toBe(snapshotB[0]);

    Reflect.set(snapshotA[0].children, 2, { text: '. Changed once.' });

    expect(value[0].children[2]).toEqual({ text: '. Try removing it.' });
    expect(snapshotB[0].children[2]).toEqual({ text: '. Try removing it.' });
  });
});
