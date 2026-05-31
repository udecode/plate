import { faker } from '@faker-js/faker';

import { getHugeDocumentBlocks } from '@/registry/examples/values/huge-document-value';

import {
  getDefaultNodeIdFragmentBlockCount,
  getNodeIdFragmentBenchmarkData,
} from './workloads';

describe('getHugeDocumentBlocks', () => {
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

describe('getNodeIdFragmentBenchmarkData', () => {
  it('builds a raw import fragment without node ids', () => {
    const blocks = 100;
    const { fragment, value } = getNodeIdFragmentBenchmarkData({
      blocks,
      kind: 'raw-import',
    });

    expect(value).toHaveLength(blocks);
    expect(fragment).toHaveLength(getDefaultNodeIdFragmentBlockCount(blocks));
    expect(value[0]?.id).toBeUndefined();
    expect(fragment[0]?.id).toBeUndefined();
  });

  it('builds a seeded duplicate-paste fragment that reuses existing ids', () => {
    const { fragment, value } = getNodeIdFragmentBenchmarkData({
      blocks: 100,
      kind: 'seeded-duplicate-paste',
    });

    const valueIds = new Set(value.map((node: any) => node.id));

    expect(fragment.length).toBeGreaterThan(0);
    expect(fragment.every((node: any) => valueIds.has(node.id))).toBe(true);
    expect(fragment[0]).not.toBe(value[0]);
  });
});
