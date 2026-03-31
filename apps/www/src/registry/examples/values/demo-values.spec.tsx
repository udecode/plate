import { createValue, DEMO_VALUES } from './demo-values';

describe('createValue', () => {
  it('returns isolated snapshots for reusable demo values', () => {
    const snapshotA = createValue('table');
    const snapshotB = createValue('table');

    expect(snapshotA).toEqual(DEMO_VALUES.table);
    expect(snapshotB).toEqual(DEMO_VALUES.table);
    expect(snapshotA).not.toBe(DEMO_VALUES.table);
    expect(snapshotB).not.toBe(DEMO_VALUES.table);
    expect(snapshotA[2]).not.toBe(DEMO_VALUES.table[2]);
    expect(snapshotA[2]).not.toBe(snapshotB[2]);

    snapshotA[2].children[1].children[0].children[0].children[0] = {
      bold: true,
      text: 'Changed heading',
    };

    expect(
      DEMO_VALUES.table[2].children[1].children[0].children[0].children[0]
    ).toMatchObject({
      bold: true,
      text: 'Heading',
    });
    expect(
      snapshotB[2].children[1].children[0].children[0].children[0]
    ).toMatchObject({
      bold: true,
      text: 'Heading',
    });
  });
});
