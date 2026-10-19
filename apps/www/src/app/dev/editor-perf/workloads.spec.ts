import { faker } from '@faker-js/faker';
import { createEditor } from 'platejs/react';

import {
  createHugeDocumentValue,
  getHugeDocumentBlocks,
} from '@/registry/examples/values/huge-document-value';

import {
  EDITOR_PERF_WORKLOADS,
  getDefaultElementIdFragmentBlockCount,
  getEditorPerfWorkloadValue,
  getEditorPerfWorkloadPlugins,
  getElementIdFragmentBenchmarkData,
  SCENARIO_WORKLOADS,
} from './workloads';

describe('editor perf workloads', () => {
  it.each([undefined, 0, 7])('rejects an invalid heading level %s', (level) => {
    expect(() =>
      createEditor({
        plugins: getEditorPerfWorkloadPlugins('huge-heading'),
        initialValue: [
          { type: 'heading', level, children: [{ text: 'Heading' }] },
        ],
      })
    ).toThrow();
  });
  it.each(SCENARIO_WORKLOADS)(
    'mounts $id in the minimal editor with its schema and text intact',
    ({ id }) => {
      const value = getEditorPerfWorkloadValue({ blocks: 2, workloadId: id });
      const editor = createEditor({
        plugins: getEditorPerfWorkloadPlugins(id),
        initialValue: value,
      });

      expect(editor.read.children()).toEqual(
        id === 'huge-dense-text'
          ? value.map((node) => ({
              ...node,
              children: [
                { text: node.children.map((child) => child.text).join('') },
              ],
            }))
          : value
      );
    }
  );
  it.each(EDITOR_PERF_WORKLOADS)(
    'builds JSON-compatible $id initial values',
    ({ id }) => {
      const value = getEditorPerfWorkloadValue({ blocks: 2, workloadId: id });

      expect(JSON.parse(JSON.stringify(value))).toEqual(value);
    }
  );
});

describe('getHugeDocumentBlocks', () => {
  it('emits the current Plate heading and paragraph schema', () => {
    const value = createHugeDocumentValue({ blocks: 2 });

    expect(value[0]).toEqual({
      children: [{ text: expect.any(String) }],
      level: 1,
      type: 'heading',
    });
    expect(value[1]).toEqual({
      children: [{ text: expect.any(String) }],
      type: 'paragraph',
    });
  });

  it('extends the cache with the same sequence as a fresh larger build', () => {
    faker.seed(1);

    const expected = Array.from({ length: 120 }, (_, index) => ({
      text:
        index % 100 === 0 ? faker.lorem.sentence() : faker.lorem.paragraph(),
      type: index % 100 === 0 ? 'heading-one' : 'paragraph',
    }));

    getHugeDocumentBlocks(2);

    expect(getHugeDocumentBlocks(120)).toEqual(expected);
  });
});

describe('getElementIdFragmentBenchmarkData', () => {
  it('builds a raw import fragment without persisted element ids', () => {
    const blocks = 100;
    const { fragment, value } = getElementIdFragmentBenchmarkData({
      blocks,
      kind: 'raw-import',
    });

    expect(value).toHaveLength(blocks);
    expect(fragment).toHaveLength(
      getDefaultElementIdFragmentBlockCount(blocks)
    );
    expect(value[0]?.id).toBeUndefined();
    expect(fragment[0]?.id).toBeUndefined();
  });

  it('builds a seeded duplicate-paste fragment that reuses existing ids', () => {
    const { fragment, value } = getElementIdFragmentBenchmarkData({
      blocks: 100,
      kind: 'seeded-duplicate-paste',
    });

    const valueIds = new Set(value.map((node: any) => node.id));

    expect(fragment.length).toBeGreaterThan(0);
    expect(fragment.every((node: any) => valueIds.has(node.id))).toBe(true);
    expect(fragment[0]).not.toBe(value[0]);
  });
});
