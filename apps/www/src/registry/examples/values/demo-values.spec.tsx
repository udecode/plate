import { getI18nValues } from '@/i18n/getI18nValues';

import { createValue, DEMO_VALUES } from './demo-values';

const findEmptyElements = (nodes: any[], path: number[] = []): string[] =>
  nodes.flatMap((node, index) => {
    if (!Array.isArray(node?.children)) return [];

    const nodePath = [...path, index];

    if (node.children.length === 0) {
      return [`[${nodePath.join(',')}] ${node.type}`];
    }

    return findEmptyElements(node.children, nodePath);
  });

describe('DEMO_VALUES', () => {
  it('gives every element at least one child', () => {
    const values = {
      ...DEMO_VALUES,
      ...Object.fromEntries(
        ['cn', 'en'].flatMap((locale) =>
          Object.entries(getI18nValues(locale)).map(([key, value]) => [
            `${locale}:${key}`,
            value,
          ])
        )
      ),
    };

    const emptyElements = Object.entries(values).flatMap(([key, value]) =>
      findEmptyElements(value as any[]).map((entry) => `${key} ${entry}`)
    );

    expect(emptyElements).toEqual([]);
  });
});

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
