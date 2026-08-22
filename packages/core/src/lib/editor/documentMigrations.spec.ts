import { type EditorDocumentValue, NodeApi } from '@platejs/plite';

import { defineBasePlugin } from '../plugin';
import {
  defineDocumentMigrations,
  migrateDocument,
} from './documentMigrations';
import { createBaseEditor } from './withPlite';

const EditorSchema = { id: 'migration-contract', version: 55 } as const;

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

const migrations = defineDocumentMigrations(EditorSchema, {
  sourceFingerprints: {
    53: 'source-53',
    54: 'source-54',
  },
  steps: {
    54: ({ document }) => append(document, '54'),
    55: ({ document }) => append(document, '55'),
  },
  unversioned: 53,
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

const text = (editor: ReturnType<typeof createBaseEditor>) =>
  NodeApi.string(editor.read.children()[0]);

describe('document migrations', () => {
  it('runs every target-version step from v53 to v55', () => {
    const editor = createBaseEditor({
      initialValue: source(53),
      migrations,
      schema: EditorSchema,
    });

    expect(text(editor)).toBe('v5455');
  });

  it('preserves an enveloped initial selection through migration', () => {
    const editor = createBaseEditor({
      initialValue: {
        ...source(53),
        selection: {
          kind: 'text',
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
      },
      migrations,
      schema: EditorSchema,
    });

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
  });

  it('maps the runner selection through structural version steps', () => {
    const SelectionSchema = {
      id: 'selection-migration',
      version: 54,
    } as const;
    const selectionMigrations = defineDocumentMigrations(SelectionSchema, {
      sourceFingerprints: { 53: 'selection-53' },
      steps: {
        54: ({ document }) => ({
          ...document,
          children: [
            { children: [{ text: 'inserted' }], type: 'paragraph' },
            ...document.children,
          ],
        }),
      },
    });
    const editor = createBaseEditor({
      migrations: selectionMigrations,
      schema: SelectionSchema,
      skipInitialization: true,
    });
    const result = migrateDocument(
      {
        document: {
          children: [{ children: [{ text: 'selected' }], type: 'paragraph' }],
        },
        schema: {
          fingerprint: 'selection-53',
          id: SelectionSchema.id,
          kind: 'named',
          version: 53,
        },
        selection: {
          kind: 'text',
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
      },
      { editor, migrations: selectionMigrations }
    );

    expect(result.selection).toEqual({
      kind: 'text',
      anchor: { offset: 1, path: [1, 0] },
      focus: { offset: 1, path: [1, 0] },
    });
  });

  it('runs only v55 for a v54 deferred document', () => {
    const editor = createBaseEditor({
      migrations,
      schema: EditorSchema,
      skipInitialization: true,
    });

    editor.update.value.replace(source(54));

    expect(text(editor)).toBe('v55');
  });

  it('runs migration before installed document preparation', () => {
    const PreparePlugin = defineBasePlugin('prepareAfterMigration', {
      prepareDocument: ({ document }) => append(document, 'p'),
    });
    const editor = createBaseEditor({
      initialValue: source(53),
      migrations,
      plugins: [PreparePlugin],
      schema: EditorSchema,
    });

    expect(text(editor)).toBe('v5455p');
  });

  it('uses the explicit floor for unversioned documents', () => {
    const editor = createBaseEditor({
      initialValue: [{ children: [{ text: 'v' }], type: 'paragraph' }],
      migrations,
      schema: EditorSchema,
    });

    expect(text(editor)).toBe('v5455');
  });

  it('does not migrate an internally synthesized current-schema default', () => {
    let calls = 0;
    const blankMigrations = defineDocumentMigrations(EditorSchema, {
      steps: {
        54: ({ document }) => {
          calls += 1;

          return document;
        },
        55: ({ document }) => {
          calls += 1;

          return document;
        },
      },
      unversioned: 53,
    });
    const editor = createBaseEditor({
      migrations: blankMigrations,
      schema: EditorSchema,
    });

    expect(calls).toBe(0);
    expect(text(editor)).toBe('');
  });

  it('rejects a missing intermediate step before publication', () => {
    const incomplete = defineDocumentMigrations(EditorSchema, {
      sourceFingerprints: { 53: 'source-53' },
      steps: { 55: ({ document }) => document },
      unversioned: 53,
    });

    expect(() =>
      createBaseEditor({
        initialValue: source(53),
        migrations: incomplete,
        schema: EditorSchema,
      })
    ).toThrow('Missing document migration step 54');
  });

  it('rejects wrong lineage, future versions, and current fingerprint drift', () => {
    const editor = createBaseEditor({
      migrations,
      schema: EditorSchema,
      skipInitialization: true,
    });
    const current = editor.read.schema.identity();

    expect(() =>
      editor.update.value.replace({
        ...source(53),
        schema: { ...source(53).schema, fingerprint: 'wrong' },
      })
    ).toThrow('does not match migration source');
    expect(() =>
      editor.update.value.replace({
        ...source(53),
        schema: { ...source(53).schema, id: 'other' },
      })
    ).toThrow('does not match migration id');
    expect(() => editor.update.value.replace(source(56))).toThrow(
      'downgrades are not supported'
    );
    expect(() =>
      editor.update.value.replace({
        document: source(55).document,
        schema: { ...current, fingerprint: 'wrong' },
      })
    ).toThrow('does not match current fingerprint');
  });

  it('requires a declared fingerprint for every historical envelope', () => {
    const incomplete = defineDocumentMigrations(EditorSchema, {
      steps: migrations.steps,
      unversioned: 53,
    });
    const editor = createBaseEditor({
      migrations: incomplete,
      schema: EditorSchema,
      skipInitialization: true,
    });

    expect(() => editor.update.value.replace(source(53))).toThrow(
      'Missing source schema fingerprint'
    );
  });

  it('returns an exact no-op for a current persisted document', () => {
    const editor = createBaseEditor({
      migrations,
      schema: EditorSchema,
      skipInitialization: true,
    });
    const input = {
      document: source(55).document,
      schema: editor.read.schema.identity(),
    };
    const result = migrateDocument(input, { editor, migrations });

    expect(result.applied).toEqual([]);
    expect(result.document).toBe(input.document);
  });
});
