import {
  createBaseEditor,
  defineBasePlugin,
  type DefinitionOf,
} from '@platejs/core';
import {
  type PropertyValueOf,
  type Value,
  SelectionApi,
  createEditor,
  schema,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

import {
  type AlignedMediaInsertInput,
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseVideoPlugin,
  type FileInsertInput,
  type ImageInsertInput,
  type ProviderMediaInsertInput,
  type mediaElementProperties,
} from './BaseMediaPlugin';
import type { ImageElement } from './image/BaseImagePlugin';
import { BaseImagePlugin } from './image/BaseImagePlugin';
import { BaseMediaEmbedPlugin } from './media-embed/BaseMediaEmbedPlugin';
import type { BasePlaceholderPlugin } from './placeholder/BasePlaceholderPlugin';

const TestInlinePlugin = defineBasePlugin('testInline', {
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
type _audioInsertOmitsName = AssertFalse<
  'name' extends keyof Parameters<
    DefinitionOf<typeof BaseAudioPlugin>['update']['insert']
  >[0]
    ? true
    : false
>;
type _fileInsertInputIsExact = AssertTrue<
  IsEqual<
    Parameters<DefinitionOf<typeof BaseFilePlugin>['update']['insert']>[0],
    FileInsertInput
  >
>;
type _fileInsertHasName = AssertTrue<
  'name' extends keyof Parameters<
    DefinitionOf<typeof BaseFilePlugin>['update']['insert']
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
type _imageInsertOmitsName = AssertFalse<
  'name' extends keyof Parameters<
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
type _embedInsertOmitsName = AssertFalse<
  'name' extends keyof Parameters<
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
      const element = editor.read.schema.element(
        editor.plugin(plugin).schema.type
      );

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
            type: 'file',
            url: 'https://platejs.org/file',
          },
        ],
      })
    ).not.toThrow();
    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [{ children: [{ text: '' }], type: 'paragraph' }],
            type: 'file',
            url: 'https://platejs.org/file',
          },
        ],
      })
    ).toThrow();
  });

  it('splits each media caption into a following paragraph on Enter', () => {
    const rows = [
      [BaseFilePlugin, PLUGINS.file],
      [BaseAudioPlugin, PLUGINS.audio],
      [BaseVideoPlugin, PLUGINS.video],
      [BaseImagePlugin, PLUGINS.image],
      [BaseMediaEmbedPlugin, PLUGINS.mediaEmbed],
    ] as const;

    const verifyCaptionSplit = <const P extends (typeof rows)[number]>([
      plugin,
      type,
    ]: P) => {
      const editor = createBaseEditor({
        editor: createEditor<Value>(),
        plugins: [plugin] as const,
        selection: {
          kind: 'text',
          anchor: { offset: 2, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
        initialValue: [
          {
            children: [{ text: 'hello' }],
            type,
            url: 'https://platejs.org/example',
          },
          { children: [{ text: 'after' }], type: 'paragraph' },
        ],
      });

      editor.update.break.insert();

      expect(editor.read.children()).toEqual([
        {
          children: [{ text: 'he' }],
          type,
          url: 'https://platejs.org/example',
        },
        { children: [{ text: 'llo' }], type: 'paragraph' },
        { children: [{ text: 'after' }], type: 'paragraph' },
      ]);
      expect(editor.read.selection()).toEqual({
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      });
    };

    rows.forEach(verifyCaptionSplit);
  });

  it('keeps hard Enter behavior outside media captions', () => {
    const editor = createBaseEditor({
      editor: createEditor<Value>(),
      plugins: [BaseImagePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'Before' }], type: 'paragraph' }],
    });

    editor.update.break.insert();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'Bef' }], type: 'paragraph' },
      { children: [{ text: 'ore' }], type: 'paragraph' },
    ]);
  });

  it('stores image alt text as a declared semantic property', () => {
    const editor = createBaseEditor({
      plugins: [BaseImagePlugin],
      initialValue: [
        {
          alt: 'Preview',
          children: [{ text: '' }],
          type: 'image',
          url: 'https://platejs.org/example',
        },
      ],
    });

    expect(editor.read.children()[0]).toMatchObject({
      alt: 'Preview',
      children: [{ text: '' }],
    });
    expect(editor.plugin(BaseImagePlugin).render.nodeProps).toBeUndefined();
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
          type: 'image',
          url: 'https://platejs.org/example',
          width: '55%',
        },
        {
          children: [{ text: '' }],
          type: 'mediaEmbed',
          url: 'https://platejs.org/embed',
          width: '65%',
        },
        {
          children: [{ text: '' }],
          type: 'audio',
          url: 'https://platejs.org/audio',
          width: '75%',
        },
        {
          children: [{ text: '' }],
          type: 'file',
          url: 'https://platejs.org/file',
          width: '80%',
        },
        {
          children: [{ text: '' }],
          type: 'video',
          url: 'https://platejs.org/video',
          width: '85%',
        },
      ],
    });

    expect(editor.read.children()).toEqual([
      expect.objectContaining({ type: 'image', width: '55%' }),
      expect.objectContaining({ type: 'mediaEmbed', width: '65%' }),
      expect.objectContaining({ type: 'audio', width: '75%' }),
      expect.objectContaining({ type: 'file', width: '80%' }),
      expect.objectContaining({ type: 'video', width: '85%' }),
    ]);
    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [{ text: '' }],
            type: 'mediaEmbed',
            url: 'https://platejs.org/example',
            width: true,
          },
        ],
      })
    ).toThrow(/element property "width" fails custom property validation/);
  });

  it('updates media width through descriptor-bound element mutation', () => {
    const image = {
      children: [{ text: '' }],
      type: 'image',
      url: 'https://platejs.org/example',
      width: '55%',
    } satisfies ImageElement;
    const editor = createBaseEditor({
      plugins: [BaseImagePlugin],
      initialValue: [image],
    });
    editor.plugin(BaseImagePlugin).update.set({ width: 420 }, { at: [0] });
    expect(editor.read.children()[0]).toMatchObject({ width: 420 });
    editor.plugin(BaseImagePlugin).update.set({ width: '64%' }, { at: [0] });
    expect(editor.read.children()[0]).toMatchObject({ width: '64%' });
  });

  it('constructs audio, file, and video through one object-input command', () => {
    const editor = createBaseEditor({
      plugins: [BaseAudioPlugin, BaseFilePlugin, BaseVideoPlugin],
      initialValue: [{ children: [{ text: 'after' }], type: 'paragraph' }],
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
      { type: 'audio', url: 'https://platejs.org/audio.mp3' },
      {
        name: 'report.pdf',
        type: 'file',
        url: 'https://platejs.org/report.pdf',
      },
      { type: 'video', url: 'https://platejs.org/video.mp4' },
      { type: 'paragraph' },
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
      initialValue: [{ children: [{ text: 'after' }], type: 'paragraph' }],
    });

    editor
      .plugin(BaseAudioPlugin)
      .update.insert({ url: 'track.mp3' }, { at: [0] });
    editor
      .plugin(BaseFilePlugin)
      .update.insert({ url: 'unsafe.pdf' }, { at: [1] });

    expect(editor.read.children()).toMatchObject([
      { type: 'audio', url: 'safe:track.mp3' },
      { type: 'paragraph' },
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
        type: 'image',
        url: 'https://platejs.org/image.png',
      },
    ]);
    expect(
      editor.api.html.deserialize({ element: '<img alt="missing" />' })
    ).toEqual([]);
    expect(
      editor.api.html.deserialize({
        element:
          '<img alt="Sized" height="180" src="https://platejs.org/image.png" width="320" />',
      })
    ).toEqual([
      {
        alt: 'Sized',
        children: [{ text: '' }],
        type: 'image',
        url: 'https://platejs.org/image.png',
        width: 320,
      },
    ]);
    expect(
      editor.api.html.deserialize({
        element:
          '<figure class="plate-image"><img alt="Sized" height="180" src="https://platejs.org/image.png" width="320" /><figcaption>Caption</figcaption></figure>',
      })
    ).toEqual([
      {
        alt: 'Sized',
        children: [{ text: 'Caption' }],
        type: 'image',
        url: 'https://platejs.org/image.png',
        width: 320,
      },
    ]);
    expect(
      editor.api.html.deserialize({
        element:
          '<img data-plate-natural-height="360" data-plate-natural-width="640" height="360" src="https://platejs.org/image.png" width="640" />',
      })
    ).toEqual([
      {
        children: [{ text: '' }],
        naturalHeight: 360,
        naturalWidth: 640,
        type: 'image',
        url: 'https://platejs.org/image.png',
      },
    ]);
    expect(
      editor.api.html.deserialize({
        element:
          '<img data-plate-natural-height="180" height="180" src="https://platejs.org/image.png" width="320" />',
      })
    ).toEqual([
      {
        children: [{ text: '' }],
        naturalHeight: 180,
        type: 'image',
        url: 'https://platejs.org/image.png',
        width: 320,
      },
    ]);
    expect(
      editor.api.html.deserialize({
        element:
          '<img data-plate-natural-height="180.5" data-plate-natural-width="320.5" src="https://platejs.org/image.png" />',
      })
    ).toEqual([
      {
        children: [{ text: '' }],
        type: 'image',
        url: 'https://platejs.org/image.png',
      },
    ]);
  });

  it('encodes a visible image and caption with standard media attributes', () => {
    const editor = createBaseEditor({
      plugins: [BaseImagePlugin],
      selection: SelectionApi.nodes([[0]]),
      initialValue: [
        {
          alt: 'Plate',
          children: [{ text: 'Image caption' }],
          naturalHeight: 360,
          naturalWidth: 640,
          type: 'image',
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
    expect(image?.dataset.plateNaturalHeight).toBe('360');
    expect(image?.dataset.plateNaturalWidth).toBe('640');
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
        naturalHeight: 360,
        naturalWidth: 640,
        type: 'image',
        url: 'https://platejs.org/image.png',
        width: '50%',
      },
    ]);
  });

  it('keeps every isolating media owner intact when deleting backward from the next block', () => {
    const rows = [
      [BaseFilePlugin, PLUGINS.file],
      [BaseAudioPlugin, PLUGINS.audio],
      [BaseVideoPlugin, PLUGINS.video],
      [BaseImagePlugin, PLUGINS.image],
      [BaseMediaEmbedPlugin, PLUGINS.mediaEmbed],
    ] as const;

    const verifyDeleteBoundary = <const P extends (typeof rows)[number]>([
      plugin,
      type,
    ]: P) => {
      const editor = createBaseEditor({
        editor: createEditor<Value>(),
        plugins: [plugin] as const,
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [1, 0] },
        },
        initialValue: [
          {
            children: [{ text: '' }],
            type,
            url: 'https://platejs.org/example',
          },
          { children: [{ text: 'after' }], type: 'paragraph' },
        ],
      });

      editor.update.text.deleteBackward({ unit: 'character' });

      expect(editor.read.children()).toHaveLength(2);
      expect(editor.read.selection()).toEqual({
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      });
    };

    rows.forEach(verifyDeleteBoundary);
  });
});
