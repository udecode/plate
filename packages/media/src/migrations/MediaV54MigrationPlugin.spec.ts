import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { property, schema, target } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseVideoPlugin,
} from '../lib/BaseMediaPlugin';
import { BaseImagePlugin } from '../lib/image/BaseImagePlugin';
import { BaseMediaEmbedPlugin } from '../lib/media-embed/BaseMediaEmbedPlugin';
import { MediaV54MigrationPlugin } from './MediaV54MigrationPlugin';

const TestBoldPlugin = createBasePlugin({
  name: 'bold',
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});
const TestMediaRootPlugin = createBasePlugin({
  name: 'testMediaRoot',
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

describe('MediaV54MigrationPlugin', () => {
  it('migrates legacy captions for every installed media owner', () => {
    const rows = [
      [BaseFilePlugin, KEYS.file],
      [BaseAudioPlugin, KEYS.audio],
      [BaseVideoPlugin, KEYS.video],
      [BaseImagePlugin, KEYS.img],
      [BaseMediaEmbedPlugin, NODES.mediaEmbed],
    ] as const;

    for (const [plugin, type] of rows) {
      const editor = createBaseEditor({
        nodeId: false,
        plugins: [MediaV54MigrationPlugin, plugin, TestBoldPlugin],
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

  it('unwraps the published single-block caption shape', () => {
    const editor = createBaseEditor({
      nodeId: false,
      plugins: [MediaV54MigrationPlugin, BaseImagePlugin, TestBoldPlugin],
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

  it('keeps direct content when the legacy source is empty', () => {
    const editor = createBaseEditor({
      nodeId: false,
      plugins: [MediaV54MigrationPlugin, BaseImagePlugin],
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

  it('migrates primary and named roots during deferred document loads', () => {
    const editor = createBaseEditor({
      nodeId: false,
      plugins: [
        MediaV54MigrationPlugin,
        BaseImagePlugin,
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

  it('preserves canonical and foreign caption content', () => {
    const editor = createBaseEditor({
      nodeId: false,
      plugins: [
        MediaV54MigrationPlugin,
        BaseImagePlugin,
        createBasePlugin({
          name: 'foreign',
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
          type: KEYS.img,
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
        type: KEYS.img,
        url: 'https://platejs.org/media',
      },
    ]);
  });

  it('rejects ambiguous caption sources with their document path', () => {
    expect(() =>
      createBaseEditor({
        nodeId: false,
        plugins: [MediaV54MigrationPlugin, BaseImagePlugin],
        initialValue: [
          {
            caption: [{ text: 'Legacy caption' }],
            children: [{ text: 'Direct caption' }],
            type: KEYS.img,
            url: 'https://platejs.org/media',
          },
        ],
      })
    ).toThrow(/main\.0 has multiple non-empty caption sources/);
  });
});
