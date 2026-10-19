import { AuthoredPlugin, projectAuthoredDocument } from '../authored';
import {
  BaseParagraphPlugin,
  createEditor as createReviewEditor,
  property,
  schema,
  target,
} from '../core';
import { BaseCodeBlockPlugin } from '../features/code-block/lib/BaseCodeBlockPlugin';
import { BaseDetailsPlugin } from '../features/details';
import { BaseIndentPlugin } from '../features/indent';
import { BaseListPlugin } from '../features/list';
import type { BasePluginInput } from '../lib/editor';
import { definePlugin } from '../lib/plugin';
import {
  defineDocumentMigrations,
  type DocumentMigrations,
  migrateDocument as runDocumentMigration,
} from './documentMigrations';
import { migrateV54 } from './migratePlateV54';

const MigrationSchema = { id: 'plate', version: 54 } as const;
const BaseCodeRootPlugin = definePlugin('codeRoot', {
  dependencies: [BaseCodeBlockPlugin],
  schema: ({ name }) => ({
    contentRoots: [
      {
        content: schema.content.element(BaseCodeBlockPlugin, { min: 1 }),
        ownership: 'exclusive',
        slot: name,
        target: target.element(name),
      },
    ],
    element: schema.element.textBlock(),
  }),
});
const defaultPlugins = [BaseCodeBlockPlugin, BaseCodeRootPlugin] as const;
const defineV54Migrations = (plugins: readonly BasePluginInput[]) =>
  defineDocumentMigrations({
    plugins,
    schema: MigrationSchema,
    sourceFingerprints: { 53: 'plate-v53' },
    steps: { 54: migrateV54 },
  });
const migrations = defineV54Migrations(defaultPlugins);

const createMigrationEditor = () => ({ migrations }) as const;

const createEditor = ({
  plugins = defaultPlugins,
}: Readonly<{
  plugins?: readonly BasePluginInput[];
  [key: string]: unknown;
}>) => ({ migrations: defineV54Migrations(plugins) });

const migrateDocument = (
  input: unknown,
  options: Readonly<{
    editor?: Readonly<{ migrations: DocumentMigrations }>;
    migrations: DocumentMigrations;
  }>
) =>
  runDocumentMigration(input, {
    migrations: options.editor?.migrations ?? options.migrations,
    ...(!input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    !Object.hasOwn(input, 'document')
      ? { source: 53 as const }
      : {}),
  }).output;

const reviewPlugins = [
  BaseParagraphPlugin,
  ...defaultPlugins,
  definePlugin('bold', {
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  }),
  AuthoredPlugin,
];

const codeBlockCountsByProjection = (children: readonly unknown[]) => {
  const { document } = migrateDocument(
    { children },
    { editor: createEditor({ plugins: reviewPlugins }), migrations }
  );
  const editor = createReviewEditor({
    initialValue: document,
    plugins: reviewPlugins,
    schema: MigrationSchema,
  });
  const count = (projection: 'accepted' | 'proposed') =>
    projectAuthoredDocument(editor.read.value(), {
      editor,
      projection,
    }).document.children.filter((node) => node.type === 'codeBlock').length;

  return { accepted: count('accepted'), proposed: count('proposed') };
};
const suggestion = (type: 'insert' | 'remove', id: string = type) => ({
  createdAt: 100,
  id,
  type,
  userId: 'alice',
});

describe('migratePlateV54 code blocks', () => {
  it('flattens legacy physical lines and preserves empty lines', () => {
    const editor = createMigrationEditor();
    const result = migrateDocument(
      {
        document: {
          children: [
            {
              children: [
                { children: [{ text: 'one' }], type: 'code_line' },
                { children: [{ text: '' }], type: 'code_line' },
                { children: [{ text: 'three' }], type: 'code_line' },
                { children: [{ text: '' }], type: 'code_line' },
              ],
              language: 'typescript',
              type: 'code_block',
            },
          ],
        },
        schema: {
          fingerprint: 'plate-v53',
          id: MigrationSchema.id,
          kind: 'named',
          version: 53,
        },
      },
      { editor, migrations }
    );

    expect(result.document.children).toEqual([
      {
        children: [{ text: 'one\n\nthree\n' }],
        language: 'typescript',
        type: 'codeBlock',
      },
    ]);
  });

  it('migrates named roots and leaves canonical blocks unchanged', () => {
    const editor = createMigrationEditor();
    const canonical = {
      children: [{ text: 'canonical' }],
      type: 'codeBlock',
    } as const;
    const document = {
      children: [
        canonical,
        {
          childRoots: { codeRoot: 'footnotes' },
          children: [{ text: '' }],
          type: 'codeRoot',
        },
      ],
      roots: {
        footnotes: [
          {
            children: [
              { children: [{ text: 'root' }], type: 'code_line' },
              { children: [{ text: 'code' }], type: 'code_line' },
            ],
            type: 'code_block',
          },
        ],
      },
    };
    const result = migrateDocument(document, { editor, migrations }).document;

    expect(result.children[0]).toEqual(canonical);
    expect(result.roots?.footnotes).toEqual([
      { children: [{ text: 'root\ncode' }], type: 'codeBlock' },
    ]);
  });

  it('maps persisted selections into the flattened text', () => {
    const editor = createMigrationEditor();
    const result = migrateDocument(
      {
        document: {
          children: [
            {
              children: [
                { children: [{ text: 'one' }], type: 'code_line' },
                { children: [{ text: 'three' }], type: 'code_line' },
              ],
              type: 'code_block',
            },
          ],
        },
        schema: {
          fingerprint: 'plate-v53',
          id: MigrationSchema.id,
          kind: 'named',
          version: 53,
        },
        selection: {
          anchor: { offset: 1, path: [0, 1, 0] },
          focus: { offset: 3, path: [0, 1, 0] },
          kind: 'text',
        },
      },
      { editor, migrations }
    );

    expect(result.selection).toEqual({
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 7, path: [0, 0] },
      kind: 'text',
    });
  });

  it('maps persisted selections inside named roots', () => {
    const editor = createMigrationEditor();
    const result = migrateDocument(
      {
        document: {
          children: [
            { children: [{ text: 'main' }], type: 'p' },
            {
              childRoots: { codeRoot: 'footnotes' },
              children: [{ text: '' }],
              type: 'codeRoot',
            },
          ],
          roots: {
            footnotes: [
              {
                children: [
                  { children: [{ text: 'root' }], type: 'code_line' },
                  { children: [{ text: 'code' }], type: 'code_line' },
                ],
                type: 'code_block',
              },
            ],
          },
        },
        schema: {
          fingerprint: 'plate-v53',
          id: MigrationSchema.id,
          kind: 'named',
          version: 53,
        },
        selection: {
          anchor: { offset: 1, path: [0, 1, 0], root: 'footnotes' },
          focus: { offset: 4, path: [0, 1, 0], root: 'footnotes' },
          kind: 'text',
        },
      },
      { editor, migrations }
    );

    expect(result.selection).toEqual({
      anchor: { offset: 6, path: [0, 0], root: 'footnotes' },
      focus: { offset: 9, path: [0, 0], root: 'footnotes' },
      kind: 'text',
    });
  });

  it('maps code-line selections after an earlier AST phase moves the block', () => {
    const editor = createEditor({
      migrations,
      plugins: [
        BaseCodeBlockPlugin,
        BaseDetailsPlugin,
        BaseIndentPlugin,
        BaseCodeRootPlugin,
      ],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const result = migrateDocument(
      {
        document: {
          children: [
            { children: [{ text: 'Title' }], type: 'toggle' },
            {
              children: [{ text: 'Body' }],
              indent: 1,
              type: 'p',
            },
            {
              children: [
                { children: [{ text: 'one' }], type: 'code_line' },
                { children: [{ text: 'two' }], type: 'code_line' },
              ],
              type: 'code_block',
            },
          ],
        },
        schema: {
          fingerprint: 'plate-v53',
          id: MigrationSchema.id,
          kind: 'named',
          version: 53,
        },
        selection: {
          anchor: { offset: 1, path: [2, 1, 0] },
          focus: { offset: 2, path: [2, 1, 0] },
          kind: 'text',
        },
      },
      { editor, migrations }
    );

    expect(result.document.children).toHaveLength(2);
    expect(result.selection).toEqual({
      anchor: { offset: 5, path: [1, 0] },
      focus: { offset: 6, path: [1, 0] },
      kind: 'text',
    });
  });

  it('keeps a range whose ends sit in paragraphs around a flattened block', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, ...defaultPlugins],
    });
    const result = migrateDocument(
      {
        document: {
          children: [
            { children: [{ text: 'before' }], type: 'p' },
            {
              children: [
                { children: [{ text: 'one' }], type: 'code_line' },
                { children: [{ text: 'two' }], type: 'code_line' },
              ],
              type: 'code_block',
            },
            { children: [{ text: 'after' }], type: 'p' },
          ],
        },
        schema: {
          fingerprint: 'plate-v53',
          id: MigrationSchema.id,
          kind: 'named',
          version: 53,
        },
        selection: {
          anchor: { offset: 2, path: [0, 0] },
          focus: { offset: 3, path: [2, 0] },
          kind: 'text',
        },
      },
      { editor, migrations }
    );

    expect(result.selection).toEqual({
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 3, path: [2, 0] },
      kind: 'text',
    });
  });

  it('keeps a caret in a paragraph between two flattened blocks', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, ...defaultPlugins],
    });
    const result = migrateDocument(
      {
        document: {
          children: [
            {
              children: [
                { children: [{ text: 'one' }], type: 'code_line' },
                { children: [{ text: 'two' }], type: 'code_line' },
              ],
              type: 'code_block',
            },
            { children: [{ text: 'middle' }], type: 'p' },
            {
              children: [
                { children: [{ text: 'three' }], type: 'code_line' },
                { children: [{ text: 'four' }], type: 'code_line' },
              ],
              type: 'code_block',
            },
          ],
        },
        schema: {
          fingerprint: 'plate-v53',
          id: MigrationSchema.id,
          kind: 'named',
          version: 53,
        },
        selection: {
          anchor: { offset: 3, path: [1, 0] },
          focus: { offset: 3, path: [1, 0] },
          kind: 'text',
        },
      },
      { editor, migrations }
    );

    expect(result.selection).toEqual({
      anchor: { offset: 3, path: [1, 0] },
      focus: { offset: 3, path: [1, 0] },
      kind: 'text',
    });
  });

  it('keeps a caret beside a flattened block in a document with legacy suggestions', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, ...defaultPlugins, AuthoredPlugin],
    });
    const result = migrateDocument(
      {
        document: {
          children: [
            { children: [{ text: 'before' }], type: 'p' },
            {
              children: [
                {
                  suggestion: true,
                  suggestion_add: {
                    createdAt: 100,
                    id: 'add',
                    type: 'insert',
                    userId: 'alice',
                  },
                  text: 'new',
                },
              ],
              type: 'p',
            },
            {
              children: [
                { children: [{ text: 'one' }], type: 'code_line' },
                { children: [{ text: 'two' }], type: 'code_line' },
              ],
              type: 'code_block',
            },
          ],
        },
        schema: {
          fingerprint: 'plate-v53',
          id: MigrationSchema.id,
          kind: 'named',
          version: 53,
        },
        selection: {
          anchor: { offset: 4, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
          kind: 'text',
        },
      },
      { editor, migrations }
    );

    expect(result.selection).toEqual({
      anchor: { offset: 4, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
      kind: 'text',
    });
  });

  it('rejects mixed invalid code-block children', () => {
    const editor = createMigrationEditor();

    expect(() =>
      migrateDocument(
        {
          children: [
            {
              children: [
                { children: [{ text: 'line' }], type: 'codeLine' },
                { text: 'loose' },
              ],
              type: 'codeBlock',
            },
          ],
        },
        { editor, migrations }
      )
    ).toThrow('expected legacy line elements');
  });

  it('keeps a suggested code block out of the projection that rejects it', () => {
    const suggested = (type: 'insert' | 'remove') => ({
      children: [
        { children: [{ text: 'one' }], type: 'code_line' },
        { children: [{ text: 'two' }], type: 'code_line' },
      ],
      suggestion: suggestion(type),
      type: 'code_block',
    });

    expect([
      codeBlockCountsByProjection([suggested('insert')]),
      codeBlockCountsByProjection([suggested('remove')]),
    ]).toEqual([
      { accepted: 0, proposed: 1 },
      { accepted: 1, proposed: 0 },
    ]);
  });

  it('refuses to flatten inserted text in lines that were already there', () => {
    const inserted = suggestion('insert', 'add');
    const insertedLine = (text: string) => ({
      children: [{ suggestion: true, suggestion_add: inserted, text }],
      type: 'code_line',
    });

    // One marked text would mark the line break between the lines as
    // inserted too. The paragraph keeps the change alive elsewhere, so the
    // count of pending changes cannot catch its loss.
    expect(() =>
      codeBlockCountsByProjection([
        {
          children: [
            { suggestion: true, suggestion_add: inserted, text: 'new' },
          ],
          type: 'p',
        },
        {
          children: [insertedLine('one'), insertedLine('two')],
          type: 'code_block',
        },
      ])
    ).toThrow('without losing their review marks');
  });

  it('drops a format suggestion on legacy code text along with the format', () => {
    const bolded = {
      createdAt: 100,
      id: 'bold',
      newProperties: { bold: true },
      type: 'update',
      userId: 'alice',
    };
    const bold = (text: string) => ({
      bold: true,
      suggestion: true,
      suggestion_bold: bolded,
      text,
    });
    const { document } = migrateDocument(
      {
        children: [
          { children: [bold('intro')], type: 'p' },
          {
            children: [
              { children: [bold('one')], type: 'code_line' },
              { children: [bold('two')], type: 'code_line' },
            ],
            type: 'code_block',
          },
        ],
      },
      { editor: createEditor({ plugins: reviewPlugins }), migrations }
    );

    expect(document.children).toEqual([
      {
        children: [
          {
            authored: [
              {
                at: 100,
                author: 'alice',
                change: 'bold',
                id: 'bold:bold',
                key: 'bold',
                kind: 'format',
                write: { kind: 'set', value: true },
              },
            ],
            bold: true,
            text: 'intro',
          },
        ],
        type: 'paragraph',
      },
      { children: [{ text: 'one\ntwo' }], type: 'codeBlock' },
    ]);
  });
});

describe('migratePlateV54 drawings', () => {
  const v53 = (
    children: readonly unknown[],
    selection?: Readonly<Record<string, unknown>>
  ) => ({
    document: { children },
    schema: {
      fingerprint: 'plate-v53',
      id: MigrationSchema.id,
      kind: 'named',
      version: 53,
    },
    ...(selection ? { selection } : {}),
  });
  const neighbors = (drawing: Readonly<Record<string, unknown>>) => [
    { children: [{ text: 'before' }], type: 'p' },
    drawing,
    { children: [{ text: 'after' }], type: 'p' },
  ];
  const mermaidDrawing = {
    children: [{ text: '' }],
    data: { code: 'graph TD; A-->B', drawingType: 'Mermaid' },
    type: 'code_drawing',
  } as const;
  const editor = createEditor({
    plugins: [BaseParagraphPlugin, ...defaultPlugins],
  });

  it('turns a drawing into a Mermaid code block and puts a caret inside it at the start of its source', () => {
    const result = migrateDocument(
      v53(neighbors(mermaidDrawing), {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
        kind: 'text',
      }),
      { editor, migrations }
    );

    expect(result.document.children[1]).toEqual({
      children: [{ text: 'graph TD; A-->B' }],
      language: 'mermaid',
      type: 'codeBlock',
    });
    expect(result.selection).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
      kind: 'text',
    });
  });

  it('keeps a range whose ends sit in paragraphs around a converted drawing', () => {
    const result = migrateDocument(
      v53(neighbors(mermaidDrawing), {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 3, path: [2, 0] },
        kind: 'text',
      }),
      { editor, migrations }
    );

    expect(result.selection).toEqual({
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 3, path: [2, 0] },
      kind: 'text',
    });
  });

  it('keeps the text of a drawing v53 turned a paragraph into, and puts a caret in any of its texts at the start of its source', () => {
    const turnedInto = (data?: unknown) => ({
      children: [{ text: 'Hello ' }, { bold: true, text: 'world' }],
      ...(data === undefined ? {} : { data }),
      type: 'code_drawing',
    });
    const caret = (path: number[], offset: number) => ({
      anchor: { offset, path },
      focus: { offset, path },
      kind: 'text',
    });
    const results = [
      [turnedInto(), caret([1, 1], 2)],
      [turnedInto(), caret([1, 0], 3)],
      [turnedInto({ code: 'graph TD;' }), caret([1, 1], 2)],
      [turnedInto({ code: null }), caret([1, 1], 2)],
    ].map(([drawing, selection]) =>
      migrateDocument(v53(neighbors(drawing), selection), {
        editor,
        migrations,
      })
    );

    expect(results.map(({ document }) => document.children[1])).toEqual(
      ['Hello world', 'Hello world', 'graph TD;', ''].map((text) => ({
        children: [{ text }],
        language: 'mermaid',
        type: 'codeBlock',
      }))
    );
    expect(results.map(({ selection }) => selection)).toEqual(
      results.map(() => caret([1, 0], 0))
    );
  });

  it('keeps a suggested drawing out of the projection that rejects it', () => {
    const suggested = (type: 'insert' | 'remove') =>
      neighbors({ ...mermaidDrawing, suggestion: suggestion(type) });

    expect([
      codeBlockCountsByProjection(suggested('insert')),
      codeBlockCountsByProjection(suggested('remove')),
    ]).toEqual([
      { accepted: 0, proposed: 1 },
      { accepted: 1, proposed: 0 },
    ]);
  });

  it('refuses a drawing whose texts differ in their suggestions', () => {
    const inserted = suggestion('insert', 'add');

    expect(() =>
      codeBlockCountsByProjection([
        {
          children: [
            { suggestion: true, suggestion_add: inserted, text: 'new' },
          ],
          type: 'p',
        },
        {
          children: [
            { suggestion: true, suggestion_add: inserted, text: 'Hello ' },
            { text: 'world' },
          ],
          type: 'code_drawing',
        },
      ])
    ).toThrow('without losing their review marks');
  });

  it('leaves a suggestion on drawing text that v53 hid behind its saved code off the code', () => {
    const inserted = suggestion('insert', 'add');
    const { document } = migrateDocument(
      {
        children: [
          {
            children: [
              { suggestion: true, suggestion_add: inserted, text: 'new' },
            ],
            type: 'p',
          },
          {
            children: [
              { suggestion: true, suggestion_add: inserted, text: 'old' },
            ],
            data: { code: 'graph TD;' },
            type: 'code_drawing',
          },
        ],
      },
      { editor: createEditor({ plugins: reviewPlugins }), migrations }
    );

    expect(document.children[1]).toEqual({
      children: [{ text: 'graph TD;' }],
      language: 'mermaid',
      type: 'codeBlock',
    });
  });

  it('refuses a suggested change to the data of a drawing', () => {
    expect(() =>
      codeBlockCountsByProjection([
        {
          ...mermaidDrawing,
          suggestion: {
            createdAt: 100,
            id: 'edit',
            newProperties: { data: mermaidDrawing.data },
            properties: { data: { code: 'graph LR;', drawingType: 'Mermaid' } },
            type: 'update',
            userId: 'alice',
          },
        },
      ])
    ).toThrow('cannot keep the suggested change to the drawing at children.0');
  });

  it('keeps a caret inside a numbered drawing in a named root at the start of its source', () => {
    const caret = (path: number[], offset: number) => ({
      anchor: { offset, path, root: 'footnotes' },
      focus: { offset, path, root: 'footnotes' },
      kind: 'text',
    });
    const result = migrateDocument(
      {
        document: {
          children: [
            {
              childRoots: { codeRoot: 'footnotes' },
              children: [{ text: '' }],
              type: 'codeRoot',
            },
          ],
          roots: {
            footnotes: [
              {
                children: [{ text: 'Hello ' }, { text: 'world' }],
                indent: 1,
                listStart: 1,
                listStyleType: 'decimal',
                type: 'code_drawing',
              },
            ],
          },
        },
        schema: {
          fingerprint: 'plate-v53',
          id: MigrationSchema.id,
          kind: 'named',
          version: 53,
        },
        selection: caret([0, 1], 2),
      },
      {
        editor: createEditor({
          plugins: [
            ...defaultPlugins,
            BaseListPlugin.configure({ targetPlugins: [BaseCodeBlockPlugin] }),
          ],
        }),
        migrations,
      }
    );

    expect(result.document.roots?.footnotes).toEqual([
      {
        children: [{ text: 'Hello world' }],
        indent: 1,
        language: 'mermaid',
        listType: 'numbered',
        type: 'codeBlock',
      },
    ]);
    expect(result.selection).toEqual(caret([0, 0], 0));
  });

  it('upgrades a numbered drawing the way it upgrades a numbered code block', () => {
    const result = migrateDocument(
      v53([
        {
          ...mermaidDrawing,
          indent: 1,
          listStart: 1,
          listStyleType: 'decimal',
        },
      ]),
      {
        editor: createEditor({
          plugins: [
            BaseParagraphPlugin,
            BaseCodeBlockPlugin,
            BaseListPlugin.configure({
              targetPlugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
            }),
          ],
        }),
        migrations,
      }
    );

    expect(result.document.children).toEqual([
      {
        children: [{ text: 'graph TD; A-->B' }],
        indent: 1,
        language: 'mermaid',
        listType: 'numbered',
        type: 'codeBlock',
      },
    ]);
  });

  it('reads saved drawing values the way v53 showed them', () => {
    const drawing = (data?: unknown) => ({
      children: [{ text: '' }],
      ...(data === undefined ? {} : { data }),
      type: 'code_drawing',
    });
    const result = migrateDocument(
      v53([
        drawing(),
        drawing({ code: null, drawingType: null }),
        drawing({ code: 42 }),
        drawing({ code: ['graph TD; A-->B'] }),
        drawing({ code: '@startuml', drawingType: 'PlantUml' }),
        drawing({ code: 'flow', drawingType: 'Sequence' }),
      ]),
      { editor, migrations }
    );

    expect(result.document.children).toEqual([
      { children: [{ text: '' }], language: 'mermaid', type: 'codeBlock' },
      { children: [{ text: '' }], language: 'mermaid', type: 'codeBlock' },
      { children: [{ text: '42' }], language: 'mermaid', type: 'codeBlock' },
      {
        children: [{ text: 'graph TD; A-->B' }],
        language: 'mermaid',
        type: 'codeBlock',
      },
      {
        children: [{ text: '@startuml' }],
        language: 'plantuml',
        type: 'codeBlock',
      },
      { children: [{ text: 'flow' }], language: 'sequence', type: 'codeBlock' },
    ]);
  });

  it('keeps a code_drawing block the app schema declares itself', () => {
    const appDrawing = definePlugin('appDrawing', {
      schema: {
        element: { ...schema.element.textBlock(), type: 'code_drawing' },
      },
    });
    const kept = { children: [{ text: 'kept' }], type: 'code_drawing' };
    const result = migrateDocument(v53([kept]), {
      editor: createEditor({ plugins: [...defaultPlugins, appDrawing] }),
      migrations,
    });

    expect(result.document.children).toEqual([kept]);
  });
});
