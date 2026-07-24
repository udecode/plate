import { NodeApi, TextApi } from '@platejs/plite';

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

    const headingPath = [2, 1, 0, 0, 0];
    const snapshotAHeading = NodeApi.get(
      { children: snapshotA, type: 'root' },
      headingPath
    );
    const snapshotBHeading = NodeApi.get(
      { children: snapshotB, type: 'root' },
      headingPath
    );
    const sourceHeading = NodeApi.get(
      { children: DEMO_VALUES.table, type: 'root' },
      headingPath
    );

    expect(TextApi.isText(snapshotAHeading)).toBe(true);

    if (!TextApi.isText(snapshotAHeading)) return;

    snapshotAHeading.text = 'Changed heading';

    expect(sourceHeading).toMatchObject({ bold: true, text: 'Heading' });
    expect(snapshotBHeading).toMatchObject({ bold: true, text: 'Heading' });
  });

  it('stores media captions as direct inline children', () => {
    const value = DEMO_VALUES.media;
    const children: unknown[] = value.children;
    const mediaTypes = new Set([
      'audio',
      'file',
      'img',
      'media_embed',
      'video',
    ]);
    const media = children.filter(
      (node): node is { children: unknown[]; type: string } =>
        typeof node === 'object' &&
        node !== null &&
        'type' in node &&
        typeof node.type === 'string' &&
        mediaTypes.has(node.type) &&
        'children' in node &&
        Array.isArray(node.children)
    );

    expect(media).toHaveLength(5);

    for (const element of media) {
      expect(element.children.length).toBeGreaterThan(0);
      expect(element.children.every((child) => TextApi.isText(child))).toBe(
        true
      );
    }
  });
});
