import {
  getDefaultNodeIdFragmentBlockCount,
  getNodeIdFragmentBenchmarkData,
} from './workloads';

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
