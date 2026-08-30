import {
  BaseParagraphPlugin,
  defineBasePlugin,
  defineDocumentMigrations,
} from 'platejs';

import {
  type Value,
  createEditor as createPliteEditor,
  property,
  schema,
  target,
} from '../facade';
import { createEditorWithEditor } from '../lib/editor/withPlite';
import { migratePlateV54 } from './index';

const MigrationSchema = { id: 'plate', version: 54 } as const;
const migrationOptions = {
  migrations: defineDocumentMigrations(MigrationSchema, {
    steps: { 54: migratePlateV54 },
    unversioned: 53,
  }),
  schema: MigrationSchema,
} as const;

const ScriptPlugin = defineBasePlugin('script', {
  schema: { mark: property.enum(['sub', 'sup'] as const) },
});
const BoldPlugin = defineBasePlugin('bold', {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});
const RootPlugin = defineBasePlugin('testRoot', {
  schema: ({ name, plugins }) => ({
    contentRoots: [
      {
        content: plugins.blockContent(),
        ownership: 'exclusive',
        slot: name,
        target: target.element(name),
      },
    ],
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  }),
});

const mediaElement = () =>
  schema.element.textBlock({
    properties: {
      isUpload: property.boolean(),
      url: property.string({ required: true }),
    },
  });
const AudioPlugin = defineBasePlugin('audio', {
  schema: { element: mediaElement() },
});
const FilePlugin = defineBasePlugin('file', {
  schema: { element: mediaElement() },
});
const ImagePlugin = defineBasePlugin('image', {
  schema: { element: mediaElement() },
});
const MediaEmbedPlugin = defineBasePlugin('mediaEmbed', {
  schema: { element: mediaElement() },
});
const VideoPlugin = defineBasePlugin('video', {
  schema: { element: mediaElement() },
});
const MediaRootPlugin = defineBasePlugin('testMediaRoot', {
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

const TableCellPlugin = defineBasePlugin('tableCell', {
  dependencies: [BaseParagraphPlugin],
  schema: ({ plugins }) => ({
    element: {
      blockContent: false,
      content: plugins.blockContent({
        default: BaseParagraphPlugin,
        min: 1,
      }),
      properties: {
        header: property.boolean({ default: false, omitDefault: true }),
      },
    },
  }),
});
const TableRowPlugin = defineBasePlugin('tableRow', {
  dependencies: [TableCellPlugin],
  schema: {
    element: {
      blockContent: false,
      content: schema.content.element(TableCellPlugin, { min: 1 }),
    },
  },
});
const TablePlugin = defineBasePlugin('table', {
  dependencies: [TableRowPlugin],
  schema: {
    element: {
      content: schema.content.element(TableRowPlugin, { min: 1 }),
    },
  },
});

const legacyTable = (text: string) => ({
  children: [
    {
      children: [
        {
          children: [{ children: [{ text }], type: 'paragraph' }],
          type: 'tableCellHeader',
        },
      ],
      type: 'tableRow',
    },
  ],
  type: 'table',
});

describe('migratePlateV54 editor loading', () => {
  describe('script marks', () => {
    it('migrates legacy marks during initialization', () => {
      const editor = createEditorWithEditor(createPliteEditor<Value>(), {
        ...migrationOptions,
        plugins: [ScriptPlugin] as const,
        initialValue: [
          {
            children: [
              { subscript: true, text: 'H' },
              { superscript: true, text: '2' },
              { subscript: false, text: 'O' },
            ],
            type: 'paragraph',
          },
        ],
        selection: {
          kind: 'text',
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
      });

      expect(editor.read.children()).toEqual([
        {
          children: [
            { script: 'sub', text: 'H' },
            { script: 'sup', text: '2' },
            { text: 'O' },
          ],
          type: 'paragraph',
        },
      ]);
      expect(editor.read.selection()).toEqual({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });
    });

    it('migrates primary and named roots during deferred document loads', () => {
      const editor = createEditorWithEditor(createPliteEditor<Value>(), {
        ...migrationOptions,
        plugins: [ScriptPlugin, RootPlugin] as const,
        skipInitialization: true,
      });

      editor.update.value.replace({
        children: [
          {
            childRoots: { testRoot: 'notes' },
            children: [{ text: '' }],
            type: 'testRoot',
          },
          {
            children: [{ subscript: true, text: 'main' }],
            type: 'paragraph',
          },
        ],
        roots: {
          notes: [
            {
              children: [{ superscript: true, text: 'root' }],
              type: 'paragraph',
            },
          ],
        },
      });

      expect(editor.read.children()[1]).toEqual({
        children: [{ script: 'sub', text: 'main' }],
        type: 'paragraph',
      });
      expect(editor.read.value().roots?.notes).toEqual([
        {
          children: [{ script: 'sup', text: 'root' }],
          type: 'paragraph',
        },
      ]);
    });

    it('rejects ambiguous legacy marks with their document path', () => {
      expect(() =>
        createEditorWithEditor(createPliteEditor<Value>(), {
          ...migrationOptions,
          plugins: [ScriptPlugin] as const,
          initialValue: [
            {
              children: [
                {
                  subscript: true,
                  superscript: true,
                  text: 'conflict',
                },
              ],
              type: 'paragraph',
            },
          ],
        })
      ).toThrow(
        /main\.0\.children\.0 cannot be both subscript and superscript/
      );
    });

    it('rejects conflicts with an existing canonical mark', () => {
      expect(() =>
        createEditorWithEditor(createPliteEditor<Value>(), {
          ...migrationOptions,
          plugins: [ScriptPlugin] as const,
          initialValue: [
            {
              children: [
                {
                  script: 'sup',
                  subscript: true,
                  text: 'conflict',
                },
              ],
              type: 'paragraph',
            },
          ],
        })
      ).toThrow(/main\.0\.children\.0 conflicts with script "sup"/);
    });
  });

  describe('media', () => {
    it('migrates legacy captions for every installed media owner', () => {
      const rows = [
        { legacyType: undefined, plugin: FilePlugin },
        { legacyType: undefined, plugin: AudioPlugin },
        { legacyType: undefined, plugin: VideoPlugin },
        { legacyType: 'img', plugin: ImagePlugin },
        { legacyType: 'media_embed', plugin: MediaEmbedPlugin },
      ] as const;

      for (const { legacyType, plugin } of rows) {
        const editor = createEditorWithEditor(createPliteEditor<Value>(), {
          ...migrationOptions,
          plugins: [plugin, BoldPlugin],
          initialValue: ({ editor: innerEditor }) => [
            {
              caption: [{ bold: true, text: 'Legacy caption' }],
              children: [{ text: '' }],
              type: legacyType ?? innerEditor.plugin(plugin).schema.type,
              url: 'https://platejs.org/media',
            },
          ],
        });
        const { type } = editor.plugin(plugin).schema;

        expect(editor.read.children()[0]).toEqual({
          children: [{ bold: true, text: 'Legacy caption' }],
          type,
          url: 'https://platejs.org/media',
        });
      }
    });

    it('unwraps the published single-block caption shape', () => {
      const editor = createEditorWithEditor(createPliteEditor<Value>(), {
        ...migrationOptions,
        plugins: [ImagePlugin, BoldPlugin],
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

    it('migrates script marks in direct legacy caption text', () => {
      const editor = createEditorWithEditor(createPliteEditor<Value>(), {
        ...migrationOptions,
        plugins: [ImagePlugin, ScriptPlugin],
        initialValue: [
          {
            caption: [{ subscript: true, text: 'Legacy caption' }],
            children: [{ text: '' }],
            type: 'img',
            url: 'https://platejs.org/media',
          },
        ],
      });

      expect(editor.read.children()[0]).toEqual({
        children: [{ script: 'sub', text: 'Legacy caption' }],
        type: 'image',
        url: 'https://platejs.org/media',
      });
    });

    it('keeps direct content when the legacy source is empty', () => {
      const editor = createEditorWithEditor(createPliteEditor<Value>(), {
        ...migrationOptions,
        plugins: [ImagePlugin],
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
      const editor = createEditorWithEditor(createPliteEditor<Value>(), {
        ...migrationOptions,
        plugins: [ImagePlugin],
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
      const editor = createEditorWithEditor(createPliteEditor<Value>(), {
        ...migrationOptions,
        plugins: [ImagePlugin, MediaEmbedPlugin, BoldPlugin, MediaRootPlugin],
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

      expect(editor.read.children()[0]).toEqual({
        children: [{ bold: true, text: 'Legacy main caption' }],
        type: 'image',
        url: 'https://platejs.org/main',
      });
      expect(editor.read.value().roots).toEqual({
        notes: [
          {
            children: [{ text: 'Legacy root caption' }],
            type: 'mediaEmbed',
            url: 'https://platejs.org/root',
          },
        ],
      });
    });

    it('preserves canonical and foreign caption content', () => {
      const editor = createEditorWithEditor(createPliteEditor<Value>(), {
        ...migrationOptions,
        plugins: [
          ImagePlugin,
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

    it('preserves legacy-looking media properties owned by the app schema', () => {
      const editor = createEditorWithEditor(createPliteEditor<Value>(), {
        migrations: migrationOptions.migrations,
        plugins: [ImagePlugin],
        schema: {
          ...MigrationSchema,
          properties: {
            caption: schema.elementProperty(property.string(), {
              target: target.element(ImagePlugin),
            }),
            placeholderId: schema.elementProperty(property.string(), {
              target: target.element(ImagePlugin),
            }),
          },
        },
        initialValue: [
          {
            caption: 'Current caption property',
            children: [{ text: '' }],
            placeholderId: 'current-placeholder',
            type: 'image',
            url: 'https://platejs.org/media',
          },
        ],
      });

      expect(editor.read.children()[0]).toEqual({
        caption: 'Current caption property',
        children: [{ text: '' }],
        placeholderId: 'current-placeholder',
        type: 'image',
        url: 'https://platejs.org/media',
      });
    });

    it('does not remigrate a legacy spelling owned by a current media type', () => {
      const editor = createEditorWithEditor(createPliteEditor<Value>(), {
        ...migrationOptions,
        plugins: [ImagePlugin, MediaEmbedPlugin],
        schema: {
          ...MigrationSchema,
          overrides: [
            schema.override(ImagePlugin, {
              element: { type: 'media_embed' },
            }),
            schema.override(MediaEmbedPlugin, {
              element: { type: 'customMediaEmbed' },
            }),
          ],
        },
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
      const editor = createEditorWithEditor(createPliteEditor<Value>(), {
        ...migrationOptions,
        plugins: [
          ImagePlugin,
          MediaEmbedPlugin,
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
        createEditorWithEditor(createPliteEditor<Value>(), {
          ...migrationOptions,
          plugins: [ImagePlugin],
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

  describe('table headers', () => {
    it('migrates legacy header cells before schema fitting', () => {
      const editor = createEditorWithEditor(createPliteEditor<Value>(), {
        ...migrationOptions,
        plugins: [TablePlugin],
        initialValue: [legacyTable('Header')],
      });

      expect(editor.read.children()[0]).toEqual({
        children: [
          {
            children: [
              {
                children: [
                  { children: [{ text: 'Header' }], type: 'paragraph' },
                ],
                header: true,
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      });
    });

    it('migrates primary and named roots during deferred loads', () => {
      const editor = createEditorWithEditor(createPliteEditor<Value>(), {
        ...migrationOptions,
        plugins: [TablePlugin, RootPlugin],
        skipInitialization: true,
      });

      editor.update.value.replace({
        children: [
          legacyTable('Main'),
          {
            childRoots: { testRoot: 'notes' },
            children: [{ text: '' }],
            type: 'testRoot',
          },
        ],
        roots: { notes: [legacyTable('Root')] },
      });

      expect(editor.read.children()[0]).toHaveProperty(
        'children.0.children.0.header',
        true
      );
      expect(editor.read.value().roots?.notes?.[0]).toHaveProperty(
        'children.0.children.0.header',
        true
      );
    });

    it('preserves canonical documents', () => {
      const canonical = {
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: 'Cell' }], type: 'paragraph' }],
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      } as const;
      const editor = createEditorWithEditor(createPliteEditor<Value>(), {
        ...migrationOptions,
        plugins: [TablePlugin],
        initialValue: [canonical],
      });

      expect(editor.read.children()).toEqual([canonical]);
    });
  });
});
