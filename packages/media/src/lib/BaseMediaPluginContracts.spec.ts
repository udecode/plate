import {
  createBaseEditor,
  createBasePlugin,
  type DefinitionOf,
} from '@platejs/core';
import { type PropertyValueOf, SelectionApi, schema } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import {
  type AlignedMediaInsertInput,
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseVideoPlugin,
  type ImageInsertInput,
  type ProviderMediaInsertInput,
} from './BaseMediaPlugin';
import { BaseImagePlugin } from './image/BaseImagePlugin';
import { BaseMediaEmbedPlugin } from './media-embed/BaseMediaEmbedPlugin';
import { mediaElementProperties } from './BaseMediaPlugin';
import { BasePlaceholderPlugin } from './placeholder/BasePlaceholderPlugin';

const TestInlinePlugin = createBasePlugin({
  name: 'testInline',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
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
type _audioInsertInputIsExact = AssertTrue<
  IsEqual<
    Parameters<DefinitionOf<typeof BaseAudioPlugin>['update']['insert']>[0],
    AlignedMediaInsertInput
  >
>;
type _audioInsertOmitsAlt = AssertFalse<
  'alt' extends keyof Parameters<
    DefinitionOf<typeof BaseAudioPlugin>['update']['insert']
  >[0]
    ? true
    : false
>;
type _imageInsertInputIsExact = AssertTrue<
  IsEqual<
    Parameters<DefinitionOf<typeof BaseImagePlugin>['update']['insert']>[0],
    ImageInsertInput
  >
>;
type _imageInsertHasAlt = AssertTrue<
  'alt' extends keyof Parameters<
    DefinitionOf<typeof BaseImagePlugin>['update']['insert']
  >[0]
    ? true
    : false
>;
type _embedInsertInputIsExact = AssertTrue<
  IsEqual<
    Parameters<
      DefinitionOf<typeof BaseMediaEmbedPlugin>['update']['insert']
    >[0],
    ProviderMediaInsertInput
  >
>;
type _embedInsertHasProvider = AssertTrue<
  'provider' extends keyof Parameters<
    DefinitionOf<typeof BaseMediaEmbedPlugin>['update']['insert']
  >[0]
    ? true
    : false
>;
type _mediaApiIsPublished = AssertTrue<
  IsEqual<
    ReturnType<DefinitionOf<typeof BaseImagePlugin>['api']['normalizeUrl']>,
    { provider?: string; sourceUrl?: string; url: string } | undefined
  >
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
      const element = editor.read.schema.element(plugin.type);

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
      editor.read.schema.assertDocument({
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
      editor.read.schema.assertDocument({
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
    expect(
      editor.plugin(BaseImagePlugin).plugin.render.nodeProps
    ).toBeUndefined();
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
      editor.read.schema.assertDocument({
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

  it('applies the shared URL policy to media insertion', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseAudioPlugin.configure({
          initialState: {
            isUrl: (url) => url.startsWith('safe:'),
            transformUrl: (url) => `safe:${url}`,
          },
        }),
        BaseFilePlugin.configure({
          initialState: {
            isUrl: () => false,
          },
        }),
      ],
      initialValue: [{ children: [{ text: 'after' }], type: KEYS.p }],
    });

    editor
      .plugin(BaseAudioPlugin)
      .update.insert({ url: 'track.mp3' }, { at: [0] });
    editor
      .plugin(BaseFilePlugin)
      .update.insert({ url: 'unsafe.pdf' }, { at: [1] });

    expect(editor.read.children()).toMatchObject([
      { type: KEYS.audio, url: 'safe:track.mp3' },
      { type: KEYS.p },
    ]);
  });

  it('deserializes images with direct children and requires a source URL', () => {
    const editor = createBaseEditor({
      plugins: [BaseImagePlugin],
    });

    expect(
      editor.api.html.deserialize({
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
      editor.api.html.deserialize({ element: '<img alt="missing" />' })
    ).toEqual([]);
  });

  it('encodes a visible image and caption with standard media attributes', () => {
    const point = { offset: 0, path: [0, 0] };
    const editor = createBaseEditor({
      plugins: [BaseImagePlugin],
      selection: SelectionApi.node([0], { anchor: point, focus: point }),
      initialValue: [
        {
          alt: 'Plate',
          children: [{ text: 'Image caption' }],
          initialHeight: 360,
          initialWidth: 640,
          type: KEYS.img,
          url: 'https://platejs.org/image.png',
          width: '50%',
        },
      ],
    });
    const data = new DataTransfer();

    editor.api.dom.clipboard.writeSelection(data);

    const document = new DOMParser().parseFromString(
      data.getData('text/html'),
      'text/html'
    );
    const figure = document.body.querySelector('figure.plate-image');
    const image = figure?.querySelector<HTMLElement>(':scope > img');

    expect(image?.getAttribute('src')).toBe('https://platejs.org/image.png');
    expect(image?.getAttribute('alt')).toBe('Plate');
    expect(image?.getAttribute('height')).toBe('360');
    expect(image?.getAttribute('width')).toBe('640');
    expect(image?.style.width).toBe('50%');
    expect(figure?.querySelector(':scope > figcaption')?.textContent).toBe(
      'Image caption'
    );
    expect(
      editor.api.html.deserialize({
        element: figure!.outerHTML,
      })
    ).toEqual([
      {
        alt: 'Plate',
        children: [{ text: 'Image caption' }],
        initialHeight: 360,
        initialWidth: 640,
        type: KEYS.img,
        url: 'https://platejs.org/image.png',
        width: '50%',
      },
    ]);
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
