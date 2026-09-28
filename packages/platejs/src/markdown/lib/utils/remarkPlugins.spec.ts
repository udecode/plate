import { unified } from 'unified';

import type { MarkdownSyncPlugin } from '../types';
import { materializeRemarkPlugins } from './remarkPlugins';

describe('materializeRemarkPlugins', () => {
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
