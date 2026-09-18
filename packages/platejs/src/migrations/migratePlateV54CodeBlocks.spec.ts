import { schema, target } from '../core';
import { BaseCodeBlockPlugin } from '../features/code-block/lib/BaseCodeBlockPlugin';
import { BaseDetailsPlugin } from '../features/details';
import { BaseIndentPlugin } from '../features/indent';
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
});
