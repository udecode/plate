import {
  getRemarkPluginsWithoutMdx,
  REMARK_MDX_TAG,
  tagRemarkPlugin,
} from './getRemarkPluginsWithoutMdx';

describe('tagRemarkPlugin', () => {
  it('preserves the plugin call contract and stores the tag', () => {
    const plugin = mock(function (this: { calls: number }, suffix: string) {
      this.calls += 1;
      return `value:${suffix}`;
    });

    const wrapped = tagRemarkPlugin(plugin, REMARK_MDX_TAG);
    const context = { calls: 0 };

    expect(wrapped.call(context, 'ok')).toBe('value:ok');
    expect(context.calls).toBe(1);
    expect((wrapped as any).__pluginTag).toBe(REMARK_MDX_TAG);
  });
});

describe('getRemarkPluginsWithoutMdx', () => {
  it('filters only plugins tagged as remark-mdx', () => {
    const keepA = () => {};
    const keepB = () => {};
    const remove = tagRemarkPlugin(() => {}, REMARK_MDX_TAG);

    expect(
      getRemarkPluginsWithoutMdx([keepA as any, remove as any, keepB as any])
    ).toEqual([keepA, keepB]);
  });
});
