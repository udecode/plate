import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseMediaEmbedPlugin } from './BaseMediaEmbedPlugin';

describe('BaseMediaEmbedPlugin', () => {
  it('configures media embeds as void elements with iframe parsing', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
    });
    const plugin = editor.getPlugin(BaseMediaEmbedPlugin);
    const transformUrl = plugin.options.transformUrl!;

    expect(plugin.node).toMatchObject({
      isElement: true,
      isVoid: true,
    });
    expect(transformUrl('<iframe src="https://x.test"></iframe>')).toBe(
      'https://x.test'
    );
    expect(
      transformUrl(
        '<blockquote class="twitter-tweet"><a href="https://x.com/platejs/status/1234567890"></a></blockquote><script async src="https://platform.twitter.com/widgets.js"></script>'
      )
    ).toBe('https://x.com/platejs/status/1234567890');
    expect(
      editor.api.html.deserialize({
        element: '<iframe src="https://example.com/embed"></iframe>',
      })
    ).toEqual([
      {
        children: [{ text: '' }],
        type: KEYS.mediaEmbed,
        url: 'https://example.com/embed',
      },
    ]);
    expect(
      editor.api.html.deserialize({ element: '<iframe></iframe>' })
    ).toEqual([{ text: '' }]);
  });

  it('insert transform stores normalized embed metadata for supported providers', async () => {
    const { insertMediaEmbed } = await import('./transforms/insertMediaEmbed');
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    insertMediaEmbed(editor, {
      url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    });

    expect(editor.read.children()[1]).toMatchObject({
      id: 'M7lc1UVf-VE',
      provider: 'youtube',
      sourceUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      type: KEYS.mediaEmbed,
      url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
    });
  });
});
