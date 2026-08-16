import assert from 'node:assert/strict';

import { createBaseEditor, ElementIdPlugin } from '@platejs/core';
import { NodeApi, SelectionApi, createEditor } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

import { parseMediaUrl, parseVideoUrl } from '../media/parseMediaUrl';
import {
  BaseMediaEmbedPlugin,
  type MediaEmbedElement,
} from './BaseMediaEmbedPlugin';

describe('BaseMediaEmbedPlugin', () => {
  it('configures media embeds as direct caption owners with iframe parsing', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
    });
    const plugin = editor.plugin(BaseMediaEmbedPlugin);
    const transformUrl = plugin.initialState.transformUrl!;

    expect(plugin.name).toBe('mediaEmbed');
    expect(plugin.name).toBe(PLUGINS.mediaEmbed);
    expect(
      editor.read.schema.element(BaseMediaEmbedPlugin)?.behavior.void
    ).toBe(false);
    expect(
      editor.read.schema.element(BaseMediaEmbedPlugin)?.behavior.isolating
    ).toBe(true);
    expect(
      editor.read.schema.element(BaseMediaEmbedPlugin)?.behavior
        .keyboardSelectable
    ).toBe(true);
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
      editor.api.html.deserialize({
        element: '<iframe src="https://example.com/embed"></iframe>',
      })
    ).toEqual([
      {
        children: [{ text: '' }],
        type: 'mediaEmbed',
        url: 'https://example.com/embed',
      },
    ]);
    expect(
      editor.api.html.deserialize({ element: '<iframe></iframe>' })
    ).toEqual([]);
    expect(
      editor.api.html.deserialize({
        element: '<iframe src="javascript:alert(1)"></iframe>',
      })
    ).toEqual([]);
  });

  it('encodes safe iframes and rejects unsafe iframe URLs', () => {
    const point = { offset: 0, path: [0, 0] };
    const safe = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      selection: SelectionApi.node([0], { anchor: point, focus: point }),
      initialValue: [
        {
          children: [{ text: 'Embed caption' }],
          type: 'mediaEmbed',
          url: 'https://example.com/embed',
          width: 640,
        },
      ],
    });
    const safeData = new DataTransfer();

    safe.api.dom.clipboard.writeSelection(safeData);

    const safeDocument = new DOMParser().parseFromString(
      safeData.getData('text/html'),
      'text/html'
    );
    const figure = safeDocument.body.querySelector('figure.plate-media-embed');
    const iframe = figure?.querySelector<HTMLElement>(':scope > iframe');

    expect(iframe?.getAttribute('src')).toBe('https://example.com/embed');
    expect(iframe?.hasAttribute('allowfullscreen')).toBe(true);
    expect(iframe?.style.width).toBe('640px');
    expect(iframe?.hasAttribute('srcdoc')).toBe(false);
    expect(figure?.getAttribute('data-plate-media-url')).toBe(
      'https://example.com/embed'
    );
    expect(figure?.getAttribute('data-plate-media-width')).toBe('640px');
    expect(
      iframe?.getAttributeNames().some((name) => name.startsWith('on'))
    ).toBe(false);
    expect(figure?.querySelector(':scope > figcaption')?.textContent).toBe(
      'Embed caption'
    );
    expect(
      safe.api.html.deserialize({
        element: figure!.outerHTML,
      })
    ).toEqual([
      {
        children: [{ text: 'Embed caption' }],
        type: 'mediaEmbed',
        url: 'https://example.com/embed',
        width: '640px',
      },
    ]);
    iframe?.remove();
    expect(
      safe.api.html.deserialize({
        element: figure!.outerHTML,
      })
    ).toEqual([
      {
        children: [{ text: 'Embed caption' }],
        type: 'mediaEmbed',
        url: 'https://example.com/embed',
        width: '640px',
      },
    ]);
    expect(
      safe.api.html.deserialize({
        element:
          '<figure class="plate-media-embed" ' +
          'data-plate-media-url="https://example.com/embed" ' +
          'data-plate-media-width="not a width">' +
          '<figcaption>Embed caption</figcaption></figure>',
      })
    ).toEqual([
      {
        children: [{ text: 'Embed caption' }],
        type: 'mediaEmbed',
        url: 'https://example.com/embed',
      },
    ]);
    expect(
      safe.api.html
        .deserialize({
          element:
            '<figure class="plate-media-embed" ' +
            'data-plate-media-url="javascript:alert(1)">' +
            '<figcaption>Embed caption</figcaption></figure>',
        })
        ?.some(
          (node) => NodeApi.isElement(node) && node.type === 'mediaEmbed'
        ) ?? false
    ).toBe(false);

    const reports: unknown[] = [];
    const unsafe = createBaseEditor({
      editor: createEditor({
        lifecycleErrorSink: (error) => reports.push(error),
      }),
      plugins: [BaseMediaEmbedPlugin],
      selection: SelectionApi.node([0], { anchor: point, focus: point }),
      initialValue: [
        {
          children: [{ text: '' }],
          type: 'mediaEmbed',
          url: 'javascript:alert(1)',
        },
      ],
    });
    const unsafeData = new DataTransfer();

    unsafe.api.dom.clipboard.writeSelection(unsafeData);

    const unsafeDocument = new DOMParser().parseFromString(
      unsafeData.getData('text/html'),
      'text/html'
    );

    expect(unsafeDocument.body.querySelector('iframe')).toBeNull();
    expect(
      unsafeDocument.body.querySelector('[data-plite-fragment]')
    ).not.toBeNull();
    expect(reports).toHaveLength(1);
  });

  it('stores normalized embed metadata for supported providers', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor.plugin(BaseMediaEmbedPlugin).update.insert({
      url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    });

    const media = editor.read.children()[1];

    if (
      !media ||
      media.type !== editor.plugin(BaseMediaEmbedPlugin).schema.type
    ) {
      throw new Error('Expected the inserted media embed element.');
    }
    const mediaElement = media as MediaEmbedElement;

    expect(mediaElement).toMatchObject({
      provider: 'youtube',
      sourceUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      type: 'mediaEmbed',
      url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
    });
    expect(mediaElement).not.toHaveProperty('id');
    expect(
      parseMediaUrl(mediaElement.url, { urlParsers: [parseVideoUrl] })?.id
    ).toBe('M7lc1UVf-VE');
  });

  it('applies the configured URL transform before normalization', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor.plugin(BaseMediaEmbedPlugin).update.insert({
      url: '<iframe src="https://www.youtube.com/watch?v=M7lc1UVf-VE"></iframe>',
    });

    expect(editor.read.children()[1]).toMatchObject({
      provider: 'youtube',
      sourceUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      type: 'mediaEmbed',
      url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
    });
  });

  it('updates a media URL through the scoped plugin transaction', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      initialValue: [
        {
          children: [{ text: '' }],
          type: 'mediaEmbed',
          url: 'https://example.com/old',
        },
      ],
    });
    const element = editor.read.nodes.get([0], {
      type: BaseMediaEmbedPlugin,
    })?.[0];

    assert(element);
    expect(
      editor.plugin(BaseMediaEmbedPlugin).update.setUrl({
        element,
        url: '<blockquote class="twitter-tweet"><a href="https://x.com/platejs/status/1234567890"></a></blockquote><script async src="https://platform.twitter.com/widgets.js"></script>',
      })
    ).toBe(true);
    expect(editor.read.children()[0]).toMatchObject({
      provider: 'twitter',
      url: 'https://x.com/platejs/status/1234567890',
    });
    expect(editor.read.children()[0]).not.toHaveProperty('id');
  });

  it('stores canonical provider metadata when updating a media URL', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      initialValue: [
        {
          children: [{ text: '' }],
          type: 'mediaEmbed',
          url: 'https://example.com/old',
        },
      ],
    });
    const element = editor.read.nodes.get([0], {
      type: BaseMediaEmbedPlugin,
    })?.[0];

    assert(element);
    expect(
      editor.plugin(BaseMediaEmbedPlugin).update.setUrl({
        element,
        url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      })
    ).toBe(true);
    expect(editor.read.children()[0]).toMatchObject({
      provider: 'youtube',
      sourceUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
    });
  });

  it('clears stale provider metadata when updating to a generic URL', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      initialValue: [
        {
          children: [{ text: '' }],
          provider: 'youtube',
          sourceUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
          type: 'mediaEmbed',
          url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
        },
      ],
    });
    const element = editor.read.nodes.get([0], {
      type: BaseMediaEmbedPlugin,
    })?.[0];

    assert(element);
    expect(
      editor.plugin(BaseMediaEmbedPlugin).update.setUrl({
        element,
        url: 'https://example.com/current',
      })
    ).toBe(true);
    expect(editor.read.children()[0]).toMatchObject({
      type: 'mediaEmbed',
      url: 'https://example.com/current',
    });
    expect(editor.read.children()[0]).not.toHaveProperty('provider');
    expect(editor.read.children()[0]).not.toHaveProperty('sourceUrl');
  });

  it('rejects unsafe media URL updates after transformation', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      initialValue: [
        {
          children: [{ text: '' }],
          type: 'mediaEmbed',
          url: 'https://example.com/old',
        },
      ],
    });
    const element = editor.read.nodes.get([0], {
      type: BaseMediaEmbedPlugin,
    })?.[0];

    assert(element);
    expect(
      editor.plugin(BaseMediaEmbedPlugin).update.setUrl({
        element,
        url: '<script async src="https://example.com/widgets.js"></script>',
      })
    ).toBe(false);
    expect(editor.read.children()[0]).toMatchObject({
      url: 'https://example.com/old',
    });
  });

  it('does nothing without a selection or explicit target', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor
      .plugin(BaseMediaEmbedPlugin)
      .update.insert({ url: 'https://platejs.org/embed' });

    expect(editor.read.children()).toHaveLength(1);
  });

  it('inserts at an exact explicit target without a selection', () => {
    const editor = createBaseEditor({
      plugins: [BaseMediaEmbedPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor
      .plugin(BaseMediaEmbedPlugin)
      .update.insert({ url: 'https://platejs.org/embed' }, { at: [0] });

    expect(editor.read.children()[0]).toMatchObject({
      type: 'mediaEmbed',
      url: 'https://platejs.org/embed',
    });
    expect(editor.read.children()[1]).toMatchObject({
      type: 'paragraph',
    });
  });

  it('coexists with explicit persisted element IDs without claiming provider IDs', () => {
    const editor = createBaseEditor({
      plugins: [
        ElementIdPlugin.configure({
          initialState: { generateId: () => 'document-node-id' },
        }),
        BaseMediaEmbedPlugin,
      ],
      initialValue: ({ editor }) => [
        {
          children: [{ text: '' }],
          id: 'document-node-id',
          type: editor.plugin(BaseMediaEmbedPlugin).schema.type,
          url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
        },
      ],
    });

    expect(editor.read.children()[0]).toMatchObject({
      id: 'document-node-id',
      type: 'mediaEmbed',
    });
  });
});
