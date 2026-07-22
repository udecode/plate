import {
  getRemarkPluginsWithoutMdx,
  REMARK_MDX_TAG,
  tagRemarkPlugin,
} from './getRemarkPluginsWithoutMdx';

describe('getRemarkPluginsWithoutMdx', () => {
  it('filters only plugins tagged as remark-mdx', () => {
    const keepA = () => {};
    const keepB = () => {};
    const remove = tagRemarkPlugin(() => {}, REMARK_MDX_TAG);

    expect(getRemarkPluginsWithoutMdx([keepA, remove, keepB])).toEqual([
      keepA,
      keepB,
    ]);
  });
});
