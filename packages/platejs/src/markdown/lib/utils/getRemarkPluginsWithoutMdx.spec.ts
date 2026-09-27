import { unified } from 'unified';

import type { MarkdownSyncPlugin } from '../types';
import {
  getRemarkPluginsWithoutMdx,
  materializeRemarkPlugins,
  REMARK_MDX_TAG,
  tagRemarkPlugin,
} from './getRemarkPluginsWithoutMdx';

describe('getRemarkPluginsWithoutMdx', () => {
  it('filters only plugins tagged as remark-mdx', () => {
    const calls: string[] = [];
    const keepA = () => {
      calls.push('a');
    };
    const keepB = () => {
      calls.push('b');
    };
    const remove = tagRemarkPlugin(() => {
      calls.push('removed');
    }, REMARK_MDX_TAG);
    const plugins = getRemarkPluginsWithoutMdx([keepA, remove, keepB]);

    expect(plugins).toHaveLength(2);
    unified().use(plugins).freeze();
    expect(calls).toEqual(['a', 'b']);
  });

  it('rejects thenable attacher results', () => {
    const plugin = (() => Promise.resolve()) as unknown as MarkdownSyncPlugin;

    expect(() =>
      unified()
        .use(materializeRemarkPlugins([plugin]))
        .freeze()
    ).toThrow('thenable attacher result');
  });

  it('rejects thenable transformer results', () => {
    const plugin = (() => () =>
      Promise.resolve()) as unknown as MarkdownSyncPlugin;
    const processor = unified().use(materializeRemarkPlugins([plugin]));

    expect(() => processor.runSync({ children: [], type: 'root' })).toThrow(
      'thenable transformer result'
    );
  });

  it('rejects callback-style transformers', () => {
    const plugin = (() => (_tree: unknown, _file: unknown, next: () => void) =>
      next()) as unknown as MarkdownSyncPlugin;
    const processor = unified().use(materializeRemarkPlugins([plugin]));

    expect(() => processor.runSync({ children: [], type: 'root' })).toThrow(
      'callback-style transformer'
    );
  });
});
