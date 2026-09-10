import { BaseCodeBlockPlugin } from '../features/code-block/lib/BaseCodeBlockPlugin';
import { BaseDetailsPlugin } from '../features/details';
import {
  defineDocumentMigrations,
  migrateDocument,
} from '../lib/editor/documentMigrations';
import { createEditor } from '../lib/editor/withPlite';
import { migratePlateV54 } from './migratePlateV54';

const MigrationSchema = { id: 'plate', version: 54 } as const;
const migrations = defineDocumentMigrations(MigrationSchema, {
  sourceFingerprints: { 53: 'plate-v53' },
  steps: { 54: migratePlateV54 },
  unversioned: 53,
});

const createMigrationEditor = () =>
  createEditor({
    migrations,
    plugins: [BaseCodeBlockPlugin],
    schema: MigrationSchema,
    skipInitialization: true,
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
      children: [canonical],
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
    const result = migratePlateV54({ document, editor });

    expect(result.children[0]).toBe(canonical);
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
          children: [{ children: [{ text: 'main' }], type: 'p' }],
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
      plugins: [BaseCodeBlockPlugin, BaseDetailsPlugin],
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
      migratePlateV54({
        document: {
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
        editor,
      })
    ).toThrow('expected legacy line elements');
  });
});
