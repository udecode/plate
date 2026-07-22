import { createBaseEditor, HtmlPlugin } from '@platejs/core';
import { KEYS, NODES } from '@platejs/utils';

import { BaseAudioPlugin } from './BaseAudioPlugin';
import { BaseFilePlugin } from './BaseFilePlugin';
import { BaseVideoPlugin } from './BaseVideoPlugin';
import { BaseImagePlugin } from './image/BaseImagePlugin';
import { BaseMediaEmbedPlugin } from './media-embed/BaseMediaEmbedPlugin';

describe('Base media plugin contracts', () => {
  it('configures file nodes as void elements', () => {
    const editor = createBaseEditor({
      plugins: [BaseFilePlugin],
    });

    expect(editor.read.schema.element(BaseFilePlugin)?.behavior.void).toBe(
      true
    );
    expect(editor.read.schema.element(BaseFilePlugin)?.behavior.voidKind).toBe(
      'block'
    );
    expect(editor.read.schema.element(BaseFilePlugin)?.groups).toContain(
      'block'
    );
  });

  it('configures audio nodes as void elements', () => {
    const editor = createBaseEditor({
      plugins: [BaseAudioPlugin],
    });

    expect(editor.read.schema.element(BaseAudioPlugin)?.behavior.void).toBe(
      true
    );
    expect(editor.read.schema.element(BaseAudioPlugin)?.behavior.voidKind).toBe(
      'block'
    );
    expect(editor.read.schema.element(BaseAudioPlugin)?.groups).toContain(
      'block'
    );
  });

  it('configures video nodes as void elements with width and height passthrough', () => {
    const editor = createBaseEditor({
      plugins: [BaseVideoPlugin],
    });

    const plugin = editor.getPlugin({ key: KEYS.video });

    expect(editor.read.schema.element(BaseVideoPlugin)?.behavior.void).toBe(
      true
    );
    expect(editor.read.schema.element(BaseVideoPlugin)?.behavior.voidKind).toBe(
      'block'
    );
    expect(editor.read.schema.element(BaseVideoPlugin)?.groups).toContain(
      'block'
    );
    expect(plugin.host).toMatchObject({
      dangerouslyAllowAttributes: ['width', 'height'],
    });
  });

  it('preserves relative media widths in document data', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseAudioPlugin,
        BaseFilePlugin,
        BaseVideoPlugin,
        BaseImagePlugin,
        BaseMediaEmbedPlugin,
      ],
      initialValue: [
        {
          children: [{ text: '' }],
          type: KEYS.img,
          url: 'https://platejs.org/example',
          width: '55%',
        },
        {
          children: [{ text: '' }],
          type: NODES.mediaEmbed,
          url: 'https://platejs.org/embed',
          width: '65%',
        },
        {
          children: [{ text: '' }],
          type: KEYS.audio,
          url: 'https://platejs.org/audio',
          width: '75%',
        },
        {
          children: [{ text: '' }],
          type: KEYS.file,
          url: 'https://platejs.org/file',
          width: '80%',
        },
        {
          children: [{ text: '' }],
          type: KEYS.video,
          url: 'https://platejs.org/video',
          width: '85%',
        },
      ],
    });

    expect(editor.read.children()).toEqual([
      expect.objectContaining({ type: KEYS.img, width: '55%' }),
      expect.objectContaining({ type: NODES.mediaEmbed, width: '65%' }),
      expect.objectContaining({ type: KEYS.audio, width: '75%' }),
      expect.objectContaining({ type: KEYS.file, width: '80%' }),
      expect.objectContaining({ type: KEYS.video, width: '85%' }),
    ]);
    expect(() =>
      editor.read.schema.validateDocument({
        children: [
          {
            children: [{ text: '' }],
            type: NODES.mediaEmbed,
            url: 'https://platejs.org/example',
            width: true,
          },
        ],
      })
    ).toThrow(/plate\.media\.width/);
  });

  it('does not deserialize an image without a source URL', () => {
    const editor = createBaseEditor({
      plugins: [BaseImagePlugin],
    });

    expect(
      editor
        .plugin(HtmlPlugin)
        .api.deserialize({ element: '<img alt="missing" />' })
    ).toEqual([]);
  });

  it('selects every media void when deleting backward from the next block', () => {
    const rows = [
      [BaseFilePlugin, KEYS.file],
      [BaseAudioPlugin, KEYS.audio],
      [BaseVideoPlugin, KEYS.video],
      [BaseImagePlugin, KEYS.img],
      [BaseMediaEmbedPlugin, NODES.mediaEmbed],
    ] as const;

    for (const [plugin, type] of rows) {
      const editor = createBaseEditor({
        plugins: [plugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [1, 0] },
        },
        initialValue: [
          {
            children: [{ text: '' }],
            type,
            ...(type === NODES.mediaEmbed || type === KEYS.img
              ? { url: 'https://platejs.org/example' }
              : {}),
          },
          { children: [{ text: 'after' }], type: KEYS.p },
        ],
      });

      editor.update.text.deleteBackward({ unit: 'character' });

      expect(editor.read.children()).toHaveLength(2);
      expect(editor.read.selection()).toEqual({
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
    }
  });
});
