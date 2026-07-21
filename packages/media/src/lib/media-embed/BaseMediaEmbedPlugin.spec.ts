import { createBaseEditor } from '@platejs/core';
import { ElementApi } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import { parseMediaUrl } from '../media/parseMediaUrl';
import { BaseMediaEmbedPlugin } from './BaseMediaEmbedPlugin';
import { parseVideoUrl } from './parseVideoUrl';

describe('BaseMediaEmbedPlugin', () => {
  it('configures media embeds as void elements with iframe parsing', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
    });
    const plugin = editor.getPlugin(BaseMediaEmbedPlugin);
    const transformUrl = plugin.options.transformUrl!;

    expect(plugin.key).toBe('mediaEmbed');
    expect(plugin.node.type).toBe(NODES.mediaEmbed);
    expect(plugin.node).toMatchObject({
      element: { groups: ['block'], void: 'block' },
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
        type: NODES.mediaEmbed,
        url: 'https://example.com/embed',
      },
    ]);
    expect(
      editor.api.html.deserialize({ element: '<iframe></iframe>' })
    ).toEqual([]);
  });

  it('insert transform stores normalized embed metadata for supported providers', async () => {
    const { insertMediaEmbed } = await import('./transforms/insertMediaEmbed');
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    insertMediaEmbed(editor, {
      url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    });

    const media = editor.read.children()[1];

    if (
      !media ||
      !ElementApi.isElement(media) ||
      typeof media.url !== 'string'
    ) {
      throw new Error('Expected the inserted media embed element.');
    }

    expect(media).toMatchObject({
      provider: 'youtube',
      sourceUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      type: NODES.mediaEmbed,
      url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
    });
    expect(media).not.toHaveProperty('id');
    expect(parseMediaUrl(media.url, { urlParsers: [parseVideoUrl] })?.id).toBe(
      'M7lc1UVf-VE'
    );
  });

  it('coexists with the global node-id schema without claiming provider IDs', () => {
    const editor = createBaseEditor({
      nodeId: {
        idCreator: () => 'document-node-id',
      },
      plugins: [BaseMediaEmbedPlugin],
      value: [
        {
          children: [{ text: '' }],
          id: 'document-node-id',
          type: NODES.mediaEmbed,
          url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
        },
      ],
    });

    expect(editor.read.children()[0]).toMatchObject({
      id: 'document-node-id',
      type: NODES.mediaEmbed,
    });
  });
});
