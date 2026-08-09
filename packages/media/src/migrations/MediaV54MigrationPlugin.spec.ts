import {
  createBaseEditor,
  defineBasePlugin,
  defineEditor,
} from '@platejs/core';
import {
  type Value,
  createEditor,
  property,
  schema,
  target,
} from '@platejs/plite';

import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseVideoPlugin,
} from '../lib/BaseMediaPlugin';
import { BaseImagePlugin } from '../lib/image/BaseImagePlugin';
import { BaseMediaEmbedPlugin } from '../lib/media-embed/BaseMediaEmbedPlugin';
import { MediaV54MigrationPlugin } from './MediaV54MigrationPlugin';

const TestBoldPlugin = defineBasePlugin('bold', {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});
const TestMediaRootPlugin = defineBasePlugin('testMediaRoot', {
  schema: ({ name, plugins }) => ({
    contentRoots: [
      {
        content: schema.content.any(
          [schema.content.group('textBlock'), plugins.blockContent()],
          { default: { type: 'paragraph' }, min: 1 }
        ),
        ownership: 'exclusive',
        slot: name,
        target: target.element(name),
      },
    ],
    element: { void: 'block' },
  }),
});

describe('MediaV54MigrationPlugin', () => {
  it('migrates legacy captions for every installed media owner', () => {
    const rows = [
      { legacyType: undefined, plugin: BaseFilePlugin },
      { legacyType: undefined, plugin: BaseAudioPlugin },
      { legacyType: undefined, plugin: BaseVideoPlugin },
      { legacyType: 'img', plugin: BaseImagePlugin },
      { legacyType: 'media_embed', plugin: BaseMediaEmbedPlugin },
    ] as const;

    for (const { legacyType, plugin } of rows) {
      const editor = createBaseEditor({
        editor: createEditor<Value>(),
        plugins: [MediaV54MigrationPlugin, plugin, TestBoldPlugin],
        initialValue: ({ editor }) => [
          {
            caption: [{ bold: true, text: 'Legacy caption' }],
            children: [{ text: '' }],
            type: legacyType ?? editor.plugin(plugin).schema.type,
            url: 'https://platejs.org/media',
          },
        ],
      });
      const type = editor.plugin(plugin).schema.type;

      expect(editor.read.children()[0]).toEqual({
        children: [{ bold: true, text: 'Legacy caption' }],
        type,
        url: 'https://platejs.org/media',
      });
    }
  });

  it('unwraps the published single-block caption shape', () => {
    const editor = createBaseEditor({
      editor: createEditor<Value>(),
      plugins: [MediaV54MigrationPlugin, BaseImagePlugin, TestBoldPlugin],
      initialValue: [
        {
          caption: [
            {
              children: [{ bold: true, text: 'Legacy block caption' }],
              type: 'paragraph',
            },
          ],
          children: [{ text: '' }],
          type: 'image',
          url: 'https://platejs.org/media',
        },
      ],
    });

    expect(editor.read.children()[0]).toEqual({
      children: [{ bold: true, text: 'Legacy block caption' }],
      type: 'image',
      url: 'https://platejs.org/media',
    });
  });

  it('keeps direct content when the legacy source is empty', () => {
    const editor = createBaseEditor({
      editor: createEditor<Value>(),
      plugins: [MediaV54MigrationPlugin, BaseImagePlugin],
      initialValue: [
        {
          caption: [{ text: '' }],
          children: [{ text: 'Direct caption' }],
          type: 'image',
          url: 'https://platejs.org/media',
        },
      ],
    });

    expect(editor.read.children()[0]).toEqual({
      children: [{ text: 'Direct caption' }],
      type: 'image',
      url: 'https://platejs.org/media',
    });
  });

  it('migrates media that predates the required URL property', () => {
    const editor = createBaseEditor({
      editor: createEditor<Value>(),
      plugins: [MediaV54MigrationPlugin, BaseImagePlugin],
      initialValue: [
        {
          children: [{ text: '' }],
          isUpload: true,
          placeholderId: 'legacy-upload',
          type: 'image',
        },
      ],
    });

    expect(editor.read.children()[0]).toEqual({
      children: [{ text: '' }],
      isUpload: true,
      type: 'image',
      url: '',
    });
  });

  it('migrates primary and named roots during deferred document loads', () => {
    const editor = createBaseEditor({
      editor: createEditor<Value>(),
      plugins: [
        MediaV54MigrationPlugin,
        BaseImagePlugin,
        BaseMediaEmbedPlugin,
        TestBoldPlugin,
        TestMediaRootPlugin,
      ],
      skipInitialization: true,
    });

    editor.update.value.replace({
      children: [
        {
          caption: [{ bold: true, text: 'Legacy main caption' }],
          children: [{ text: '' }],
          type: 'img',
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
            type: 'media_embed',
            url: 'https://platejs.org/root',
          },
        ],
      },
    });
    const imageType = editor.plugin(BaseImagePlugin).schema.type;
    const mediaEmbedType = editor.plugin(BaseMediaEmbedPlugin).schema.type;

    expect(editor.read.children()[0]).toEqual({
      children: [{ bold: true, text: 'Legacy main caption' }],
      type: imageType,
      url: 'https://platejs.org/main',
    });
    expect(editor.read.value().roots).toEqual({
      notes: [
        {
          children: [{ text: 'Legacy root caption' }],
          type: mediaEmbedType,
          url: 'https://platejs.org/root',
        },
      ],
    });
  });

  it('preserves canonical and foreign caption content', () => {
    const editor = createBaseEditor({
      editor: createEditor<Value>(),
      plugins: [
        MediaV54MigrationPlugin,
        BaseImagePlugin,
        defineBasePlugin('foreign', {
          schema: {
            element: {
              content: schema.content.text({ default: 'text', min: 1 }),
              properties: { caption: property.string() },
            },
          },
        }),
      ],
      initialValue: [
        {
          caption: 'foreign',
          children: [{ text: 'Canonical caption' }],
          type: 'foreign',
        },
        {
          children: [{ text: 'Media caption' }],
          type: 'image',
          url: 'https://platejs.org/media',
        },
      ],
    });

    expect(editor.read.children()).toEqual([
      {
        caption: 'foreign',
        children: [{ text: 'Canonical caption' }],
        type: 'foreign',
      },
      {
        children: [{ text: 'Media caption' }],
        type: 'image',
        url: 'https://platejs.org/media',
      },
    ]);
  });

  it('does not remigrate a legacy spelling owned by a current media type', () => {
    const definition = defineEditor('mediaLegacyTypeCollision', {
      plugins: [MediaV54MigrationPlugin, BaseImagePlugin, BaseMediaEmbedPlugin],
      schema: {
        overrides: [
          schema.override(BaseImagePlugin, {
            element: { type: 'media_embed' },
          }),
          schema.override(BaseMediaEmbedPlugin, {
            element: { type: 'customMediaEmbed' },
          }),
        ],
      },
    });
    const editor = createBaseEditor({
      editor: createEditor<Value>(),
      plugins: definition.plugins,
      initialValue: [
        {
          caption: [{ text: 'Image caption' }],
          children: [{ text: '' }],
          type: 'media_embed',
          url: 'https://platejs.org/image',
        },
      ],
    });

    expect(editor.read.children()[0]).toEqual({
      children: [{ text: 'Image caption' }],
      type: 'media_embed',
      url: 'https://platejs.org/image',
    });
  });

  it('does not migrate legacy spellings owned by current non-media elements', () => {
    const ForeignImagePlugin = defineBasePlugin('foreignImage', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { caption: property.string() },
          type: 'img',
        },
      },
    });
    const ForeignEmbedPlugin = defineBasePlugin('foreignEmbed', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { caption: property.string() },
          type: 'media_embed',
        },
      },
    });
    const editor = createBaseEditor({
      editor: createEditor<Value>(),
      plugins: [
        MediaV54MigrationPlugin,
        BaseImagePlugin,
        BaseMediaEmbedPlugin,
        ForeignImagePlugin,
        ForeignEmbedPlugin,
      ],
      initialValue: [
        {
          caption: 'foreign image',
          children: [{ text: 'Image body' }],
          type: 'img',
        },
        {
          caption: 'foreign embed',
          children: [{ text: 'Embed body' }],
          type: 'media_embed',
        },
      ],
    });

    expect(editor.read.children()).toEqual([
      {
        caption: 'foreign image',
        children: [{ text: 'Image body' }],
        type: 'img',
      },
      {
        caption: 'foreign embed',
        children: [{ text: 'Embed body' }],
        type: 'media_embed',
      },
    ]);
  });

  it('rejects ambiguous caption sources with their document path', () => {
    expect(() =>
      createBaseEditor({
        editor: createEditor<Value>(),
        plugins: [MediaV54MigrationPlugin, BaseImagePlugin],
        initialValue: [
          {
            caption: [{ text: 'Legacy caption' }],
            children: [{ text: 'Direct caption' }],
            type: 'image',
            url: 'https://platejs.org/media',
          },
        ],
      })
    ).toThrow(/main\.0 has multiple non-empty caption sources/);
  });
});
