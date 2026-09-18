import { BaseParagraphPlugin, createEditor, NodeApi } from 'platejs';

import type { EditorDocumentValue } from '../core';
import {
  defineDocumentMigrations,
  type DocumentMigrations,
  migrateDocument,
} from './documentMigrations';

const EditorSchema = { id: 'migration-contract', version: 3 } as const;
const plugins = [BaseParagraphPlugin] as const;

const append = (document: EditorDocumentValue, suffix: string) => ({
  ...document,
  children: document.children.map((element) => ({
    ...element,
    children: element.children.map((child) =>
      'text' in child
        ? { ...child, text: `${String(child.text)}${suffix}` }
        : child
    ),
  })),
});

const migrations = defineDocumentMigrations({
  plugins,
  schema: EditorSchema,
  sourceFingerprints: {
    1: 'source-1',
    2: 'source-2',
  },
  steps: {
    2: ({ document }) => ({ document: append(document, '2') }),
    3: ({ document }) => ({ document: append(document, '3') }),
  },
});

const source = (version: number, text = 'v') => ({
  document: {
    children: [{ children: [{ text }], type: 'paragraph' }],
  },
  schema: {
    fingerprint: `source-${version}`,
    id: EditorSchema.id,
    kind: 'named' as const,
    version,
  },
});

describe('document migrations', () => {
  it('preflights and runs the exact ascending chain into one current envelope', () => {
    const input = source(1);
    const result = migrateDocument(input, { migrations });

    expect(result.applied).toEqual([2, 3]);
    expect(result.source).toBe(1);
    expect(NodeApi.string(result.output.document.children[0])).toBe('v23');
    expect(result.output.schema).toMatchObject({
      id: EditorSchema.id,
      kind: 'named',
      version: EditorSchema.version,
    });
    expect(Object.keys(result).sort()).toEqual(['applied', 'output', 'source']);
    expect(Object.keys(result.output).sort()).toEqual(['document', 'schema']);
    expect(result.output.document).not.toBe(input.document);
    expect(input).toEqual(source(1));
    expect(Object.isFrozen(result.output.document)).toBe(true);
  });

  it('requires explicit source intent for raw documents and accepts current intent', () => {
    const raw = source(1).document;

    expect(() =>
      (
        migrateDocument as (
          input: unknown,
          options: { migrations: DocumentMigrations }
        ) => unknown
      )(raw, { migrations })
    ).toThrow('requires explicit source intent');

    expect(
      NodeApi.string(
        migrateDocument(raw, { migrations, source: 1 }).output.document
          .children[0]
      )
    ).toBe('v23');

    const current = migrateDocument(raw, {
      migrations,
      source: 'current',
    });

    expect(current.applied).toEqual([]);
    expect(NodeApi.string(current.output.document.children[0])).toBe('v');
  });

  it('resolves the whole chain before invoking any migration callback', () => {
    let calls = 0;
    const incomplete = defineDocumentMigrations({
      plugins,
      schema: EditorSchema,
      sourceFingerprints: { 1: 'source-1' },
      steps: {
        2: ({ document }) => {
          calls += 1;

          return { document };
        },
      },
    });

    expect(() =>
      migrateDocument(source(1), { migrations: incomplete })
    ).toThrow('Missing document migration step 3');
    expect(calls).toBe(0);
  });

  it('maps selections structurally and lets an explicit mapper supersede the default', () => {
    const selectionMigrations = defineDocumentMigrations({
      plugins,
      schema: { id: 'selection-migration', version: 2 },
      sourceFingerprints: { 1: 'selection-1' },
      steps: {
        2: ({ document }) => ({
          document: {
            ...document,
            children: [
              { children: [{ text: 'inserted' }], type: 'paragraph' },
              ...document.children,
            ],
          },
          mapSelection: ({ mappedSelection }) =>
            mappedSelection && 'anchor' in mappedSelection
              ? {
                  ...mappedSelection,
                  affinity: 'forward' as const,
                }
              : mappedSelection,
        }),
      },
    });
    const result = migrateDocument(
      {
        document: source(1, 'selected').document,
        schema: {
          fingerprint: 'selection-1',
          id: 'selection-migration',
          kind: 'named',
          version: 1,
        },
        selection: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
          kind: 'text',
        },
      },
      { migrations: selectionMigrations }
    );

    expect(result.output.selection).toEqual({
      affinity: 'forward',
      anchor: { offset: 1, path: [1, 0] },
      focus: { offset: 1, path: [1, 0] },
      kind: 'text',
    });
  });

  it('rejects invalid boundaries and structurally forged definitions', () => {
    expect(() =>
      migrateDocument(
        {
          ...source(1),
          extra: true,
        },
        { migrations }
      )
    ).toThrow('invalid property "extra"');
    expect(() =>
      migrateDocument(
        {
          ...source(1),
          schema: { ...source(1).schema, fingerprint: 'wrong' },
        },
        { migrations }
      )
    ).toThrow('Unknown schema fingerprint');
    expect(() =>
      migrateDocument(source(1), {
        migrations: {
          id: migrations.id,
          sourceFingerprints: migrations.sourceFingerprints,
          steps: migrations.steps,
          version: migrations.version,
        } as DocumentMigrations,
      })
    ).toThrow('must come from defineDocumentMigrations');

    const hostile = Object.defineProperty({}, 'children', {
      enumerable: true,
      get: () => source(1).document.children,
    });

    expect(() => migrateDocument(hostile, { migrations, source: 1 })).toThrow(
      'JSON-compatible data'
    );
  });

  it('keeps ordinary editor loading current-only', () => {
    expect(() =>
      createEditor({
        initialValue: source(1),
        plugins,
        schema: EditorSchema,
      })
    ).toThrow('does not match current schema');

    const migrated = migrateDocument(source(1), { migrations }).output;
    const editor = createEditor({
      initialValue: migrated,
      plugins,
      schema: EditorSchema,
    });

    expect(NodeApi.string(editor.read.children()[0])).toBe('v23');

    expect(() =>
      createEditor({
        initialValue: { ...migrated, extra: true },
        plugins,
        schema: EditorSchema,
      } as never)
    ).toThrow('field "extra" is not supported');
    expect(() =>
      createEditor({
        initialValue: migrated,
        migrations,
        plugins,
        schema: EditorSchema,
      } as never)
    ).toThrow('editor `migrations` is unsupported');
  });
});
