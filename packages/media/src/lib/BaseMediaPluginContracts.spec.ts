import { createBaseEditor, createBasePlugin, HtmlPlugin } from '@platejs/core';
import { property, type PropertyValueOf, schema, target } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import { BaseAudioPlugin } from './BaseAudioPlugin';
import { BaseFilePlugin } from './BaseFilePlugin';
import { BaseVideoPlugin } from './BaseVideoPlugin';
import { BaseImagePlugin } from './image/BaseImagePlugin';
import { BaseMediaEmbedPlugin } from './media-embed/BaseMediaEmbedPlugin';
import { mediaElementProperties } from './media/types';
import { BasePlaceholderPlugin } from './placeholder/BasePlaceholderPlugin';

const TestBoldPlugin = createBasePlugin({
  key: 'bold',
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});
const TestInlinePlugin = createBasePlugin({
  key: 'testInline',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
});
const TestMediaRootPlugin = createBasePlugin({
  key: 'testMediaRoot',
  schema: ({ own, plugins, type }) => ({
    contentRoots: [
      own.contentRoot(
        schema.content.any(
          [schema.content.group('textBlock'), plugins.blockContent()],
          { default: { type: KEYS.p }, min: 1 }
        ),
        {
          ownership: 'exclusive',
          target: target.types([type]),
        }
      ),
    ],
    element: { void: 'block' },
  }),
});

type AssertFalse<T extends false> = T;
type AssertTrue<T extends true> = T;
type IsEqual<TLeft, TRight> =
  (<T>() => T extends TLeft ? 1 : 2) extends <T>() => T extends TRight ? 1 : 2
    ? true
    : false;
type IsAny<T> = 0 extends 1 & T ? true : false;

type _baseImagePluginNotAny = AssertFalse<IsAny<typeof BaseImagePlugin>>;
type _baseMediaEmbedPluginNotAny = AssertFalse<
  IsAny<typeof BaseMediaEmbedPlugin>
>;
type _basePlaceholderPluginNotAny = AssertFalse<
  IsAny<typeof BasePlaceholderPlugin>
>;
type _mediaWidthValueIsInferred = AssertTrue<
  IsEqual<PropertyValueOf<typeof mediaElementProperties.width>, number | string>
>;

describe('Base media plugin contracts', () => {
  it('configures every media node as a keyboard-selectable direct caption owner', () => {
    for (const plugin of [
      BaseFilePlugin,
      BaseAudioPlugin,
      BaseVideoPlugin,
      BaseImagePlugin,
      BaseMediaEmbedPlugin,
    ]) {
      const editor = createBaseEditor({ plugins: [plugin] });
      const element = editor.read.schema.element(plugin);

      expect(element?.behavior).toMatchObject({
        isolating: true,
        keyboardSelectable: true,
        void: false,
      });
      expect(element?.content).toMatchObject({
        allowsText: true,
        default: 'text',
        min: 1,
      });
      expect(element?.groups).toContain('block');
      expect(plugin.dependencies).toEqual([]);
    }
  });

  it('accepts direct caption text and rejects block wrappers', () => {
    const editor = createBaseEditor({
      plugins: [BaseFilePlugin, TestInlinePlugin],
    });

    expect(() =>
      editor.read.schema.validateDocument({
        children: [
          {
            children: [
              { text: 'Before ' },
              {
                children: [{ text: 'inline' }],
                type: 'testInline',
              },
              { text: ' after' },
            ],
            type: KEYS.file,
            url: 'https://platejs.org/file',
          },
        ],
      })
    ).not.toThrow();
    expect(() =>
      editor.read.schema.validateDocument({
        children: [
          {
            children: [{ children: [{ text: '' }], type: KEYS.p }],
            type: KEYS.file,
            url: 'https://platejs.org/file',
          },
        ],
      })
    ).toThrow();
  });

  it('stores image alt text as a declared semantic property', () => {
    const editor = createBaseEditor({
      plugins: [BaseImagePlugin],
      initialValue: [
        {
          alt: 'Preview',
          children: [{ text: '' }],
          type: KEYS.img,
          url: 'https://platejs.org/example',
        },
      ],
    });

    expect(editor.read.children()[0]).toMatchObject({
      alt: 'Preview',
      children: [{ text: '' }],
    });
    expect(editor.getPlugin(BaseImagePlugin).render.nodeProps).toBeUndefined();
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
    ).toThrow(/element property "width" fails custom property validation/);
  });

  it('constructs audio, file, and video through one object-input command', () => {
    const editor = createBaseEditor({
      plugins: [BaseAudioPlugin, BaseFilePlugin, BaseVideoPlugin],
      initialValue: [{ children: [{ text: 'after' }], type: KEYS.p }],
    });

    editor
      .plugin(BaseAudioPlugin)
      .update.insert({ url: 'https://platejs.org/audio.mp3' }, { at: [0] });
    editor
      .plugin(BaseFilePlugin)
      .update.insert(
        { name: 'report.pdf', url: 'https://platejs.org/report.pdf' },
        { at: [1] }
      );
    editor
      .plugin(BaseVideoPlugin)
      .update.insert({ url: 'https://platejs.org/video.mp4' }, { at: [2] });

    expect(editor.read.children()).toMatchObject([
      { type: KEYS.audio, url: 'https://platejs.org/audio.mp3' },
      {
        name: 'report.pdf',
        type: KEYS.file,
        url: 'https://platejs.org/report.pdf',
      },
      { type: KEYS.video, url: 'https://platejs.org/video.mp4' },
      { type: KEYS.p },
    ]);
  });

  it('normalizes embedded legacy captions for every media owner', () => {
    const rows = [
      [BaseFilePlugin, KEYS.file],
      [BaseAudioPlugin, KEYS.audio],
      [BaseVideoPlugin, KEYS.video],
      [BaseImagePlugin, KEYS.img],
      [BaseMediaEmbedPlugin, NODES.mediaEmbed],
    ] as const;

    for (const [plugin, type] of rows) {
      const editor = createBaseEditor({
        plugins: [plugin, TestBoldPlugin],
        initialValue: [
          {
            caption: [{ bold: true, text: 'Legacy caption' }],
            children: [{ text: '' }],
            type,
            url: 'https://platejs.org/media',
          },
        ],
      });

      expect(editor.read.children()[0]).toEqual({
        children: [{ bold: true, text: 'Legacy caption' }],
        type,
        url: 'https://platejs.org/media',
      });
    }
  });

  it('unwraps the published single-block legacy caption shape', () => {
    const editor = createBaseEditor({
      plugins: [BaseImagePlugin, TestBoldPlugin],
      initialValue: [
        {
          caption: [
            {
              children: [{ bold: true, text: 'Legacy block caption' }],
              type: KEYS.p,
            },
          ],
          children: [{ text: '' }],
          type: KEYS.img,
          url: 'https://platejs.org/media',
        },
      ],
    });

    expect(editor.read.children()[0]).toEqual({
      children: [{ bold: true, text: 'Legacy block caption' }],
      type: KEYS.img,
      url: 'https://platejs.org/media',
    });
  });

  it('rejects ambiguous published and direct caption content', () => {
    expect(() =>
      createBaseEditor({
        plugins: [BaseImagePlugin],
        initialValue: [
          {
            caption: [{ text: 'Legacy caption' }],
            children: [{ text: 'Direct caption' }],
            type: KEYS.img,
            url: 'https://platejs.org/media',
          },
        ],
      })
    ).toThrow(/multiple non-empty caption sources/);
  });

  it('keeps direct content when the legacy source is absent', () => {
    const editor = createBaseEditor({
      plugins: [BaseImagePlugin],
      initialValue: [
        {
          caption: [{ text: '' }],
          children: [{ text: 'Direct caption' }],
          type: KEYS.img,
          url: 'https://platejs.org/media',
        },
      ],
    });

    expect(editor.read.children()[0]).toEqual({
      children: [{ text: 'Direct caption' }],
      type: KEYS.img,
      url: 'https://platejs.org/media',
    });
  });

  it('normalizes legacy captions in named roots during initialization', () => {
    const editor = createBaseEditor({
      plugins: [BaseImagePlugin, TestMediaRootPlugin],
      initialValue: {
        children: [
          {
            childRoots: { testMediaRoot: 'notes' },
            children: [{ text: '' }],
            type: 'testMediaRoot',
          },
        ],
        roots: {
          notes: [
            {
              caption: [{ text: 'Legacy root caption' }],
              children: [{ text: '' }],
              type: KEYS.img,
              url: 'https://platejs.org/media',
            },
          ],
        },
      },
    });

    expect(editor.read.value().roots?.notes).toEqual([
      {
        children: [{ text: 'Legacy root caption' }],
        type: KEYS.img,
        url: 'https://platejs.org/media',
      },
    ]);
  });

  it('normalizes deferred legacy document replacements without a migration script', () => {
    const editor = createBaseEditor({
      plugins: [BaseImagePlugin, TestBoldPlugin, TestMediaRootPlugin],
      skipInitialization: true,
    });

    editor.update.value.replace({
      children: [
        {
          caption: [{ bold: true, text: 'Legacy main caption' }],
          children: [{ text: '' }],
          type: KEYS.img,
          url: 'https://platejs.org/main',
        },
        {
          childRoots: { testMediaRoot: 'notes' },
          children: [{ text: '' }],
          type: 'testMediaRoot',
        },
      ],
      roots: {
        notes: [
          {
            caption: [{ text: 'Legacy root caption' }],
            children: [{ text: '' }],
            type: KEYS.img,
            url: 'https://platejs.org/root',
          },
        ],
      },
    });

    expect(editor.read.children()[0]).toEqual({
      children: [{ bold: true, text: 'Legacy main caption' }],
      type: KEYS.img,
      url: 'https://platejs.org/main',
    });
    expect(editor.read.value().roots).toEqual({
      notes: [
        {
          children: [{ text: 'Legacy root caption' }],
          type: KEYS.img,
          url: 'https://platejs.org/root',
        },
      ],
    });
  });

  it('deserializes images with direct children and requires a source URL', () => {
    const editor = createBaseEditor({
      plugins: [BaseImagePlugin],
    });

    expect(
      editor.plugin(HtmlPlugin).api.deserialize({
        element:
          '<img alt="Direct caption owner" src="https://platejs.org/image.png" />',
      })
    ).toEqual([
      {
        alt: 'Direct caption owner',
        children: [{ text: '' }],
        type: KEYS.img,
        url: 'https://platejs.org/image.png',
      },
    ]);
    expect(
      editor
        .plugin(HtmlPlugin)
        .api.deserialize({ element: '<img alt="missing" />' })
    ).toEqual([]);
  });

  it('keeps every isolating media owner intact when deleting backward from the next block', () => {
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
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      });
    }
  });
});
