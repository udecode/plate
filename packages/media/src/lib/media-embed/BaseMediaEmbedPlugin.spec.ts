import { createBaseEditor, HtmlPlugin } from '@platejs/core';
import { ElementApi } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import { parseMediaUrl, parseVideoUrl } from '../media/parseMediaUrl';
import { BaseMediaEmbedPlugin } from './BaseMediaEmbedPlugin';

describe('BaseMediaEmbedPlugin', () => {
  it('configures media embeds as void elements with iframe parsing', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
    });
    const plugin = editor.getPlugin(BaseMediaEmbedPlugin);
    const transformUrl = plugin.options.transformUrl!;

    expect(plugin.key).toBe('mediaEmbed');
    expect(plugin.type).toBe(NODES.mediaEmbed);
    expect(
      editor.read.schema.element(BaseMediaEmbedPlugin)?.behavior.void
    ).toBe(true);
    expect(
      editor.read.schema.element(BaseMediaEmbedPlugin)?.behavior.voidKind
    ).toBe('block');
    expect(editor.read.schema.element(BaseMediaEmbedPlugin)?.groups).toContain(
      'block'
    );
    expect(transformUrl('<iframe src="https://x.test"></iframe>')).toBe(
      'https://x.test'
    );
    expect(
      transformUrl(
        '<blockquote class="twitter-tweet"><a href="https://x.com/platejs/status/1234567890"></a></blockquote><script async src="https://platform.twitter.com/widgets.js"></script>'
      )
    ).toBe('https://x.com/platejs/status/1234567890');
    expect(
      editor.plugin(HtmlPlugin).api.deserialize({
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
      editor
        .plugin(HtmlPlugin)
        .api.deserialize({ element: '<iframe></iframe>' })
    ).toEqual([]);
  });

  it('stores normalized embed metadata for supported providers', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor
      .plugin(BaseMediaEmbedPlugin)
      .update.insert('https://www.youtube.com/watch?v=M7lc1UVf-VE');

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

  it('applies the configured URL transform before normalization', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor
      .plugin(BaseMediaEmbedPlugin)
      .update.insert(
        '<iframe src="https://www.youtube.com/watch?v=M7lc1UVf-VE"></iframe>'
      );

    expect(editor.read.children()[1]).toMatchObject({
      provider: 'youtube',
      sourceUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      type: NODES.mediaEmbed,
      url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
    });
  });

  it('does nothing without a selection or explicit target', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor
      .plugin(BaseMediaEmbedPlugin)
      .update.insert('https://platejs.org/embed');

    expect(editor.read.children()).toHaveLength(1);
  });

  it('inserts at an exact explicit target without a selection', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      initialValue: [{ children: [{ text: '' }], type: KEYS.p }],
    });

    editor
      .plugin(BaseMediaEmbedPlugin)
      .update.insert('https://platejs.org/embed', { at: [0] });

    expect(editor.read.children()[0]).toMatchObject({
      type: NODES.mediaEmbed,
      url: 'https://platejs.org/embed',
    });
    expect(editor.read.children()[1]).toMatchObject({ type: KEYS.p });
  });

  it('coexists with the global node-id schema without claiming provider IDs', () => {
    const editor = createBaseEditor({
      nodeId: {
        idCreator: () => 'document-node-id',
      },
      plugins: [BaseMediaEmbedPlugin],
      initialValue: [
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
