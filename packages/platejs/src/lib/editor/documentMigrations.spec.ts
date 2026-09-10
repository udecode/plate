import { type EditorDocumentValue, NodeApi } from '../../core';
import { defineBasePlugin } from '../plugin';
import {
  defineDocumentMigrations,
  migrateDocument,
} from './documentMigrations';
import { createEditor } from './withPlite';

const EditorSchema = { id: 'migration-contract', version: 3 } as const;

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
    1: 'source-1',
    2: 'source-2',
  },
  steps: {
    2: ({ document }) => append(document, '2'),
    3: ({ document }) => append(document, '3'),
  },
  unversioned: 1,
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

const text = (editor: ReturnType<typeof createEditor>) =>
  NodeApi.string(editor.read.children()[0]);

describe('document migrations', () => {
  it('runs every target-version step in ascending order', () => {
    const editor = createEditor({
      initialValue: source(1),
      migrations,
      schema: EditorSchema,
    });

    expect(text(editor)).toBe('v23');
  });

  it('preserves an enveloped initial selection through migration', () => {
    const editor = createEditor({
      initialValue: {
        ...source(1),
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
    const editor = createEditor({
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

  it('runs only the remaining step for a deferred document', () => {
    const editor = createEditor({
      migrations,
      schema: EditorSchema,
      skipInitialization: true,
    });

    editor.update.value.replace(source(2));

    expect(text(editor)).toBe('v3');
  });

  it('runs migration before installed document preparation', () => {
    const PreparePlugin = defineBasePlugin('prepareAfterMigration', {
      prepareDocument: ({ document }) => append(document, 'p'),
    });
    const editor = createEditor({
      initialValue: source(1),
      migrations,
      plugins: [PreparePlugin],
      schema: EditorSchema,
    });

    expect(text(editor)).toBe('v23p');
  });

  it('uses the explicit floor for unversioned documents', () => {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'v' }], type: 'paragraph' }],
      migrations,
      schema: EditorSchema,
    });

    expect(text(editor)).toBe('v23');
  });

  it('does not migrate an internally synthesized current-schema default', () => {
    let calls = 0;
    const blankMigrations = defineDocumentMigrations(EditorSchema, {
      steps: {
        2: ({ document }) => {
          calls += 1;

          return document;
        },
        3: ({ document }) => {
          calls += 1;

          return document;
        },
      },
      unversioned: 1,
    });
    const editor = createEditor({
      migrations: blankMigrations,
      schema: EditorSchema,
    });

    expect(calls).toBe(0);
    expect(text(editor)).toBe('');
  });

  it('rejects a missing intermediate step before publication', () => {
    const incomplete = defineDocumentMigrations(EditorSchema, {
      sourceFingerprints: { 1: 'source-1' },
      steps: { 3: ({ document }) => document },
      unversioned: 1,
    });

    expect(() =>
      createEditor({
        initialValue: source(1),
        migrations: incomplete,
        schema: EditorSchema,
      })
    ).toThrow('Missing document migration step 2');
  });

  it('rejects wrong lineage, future versions, and current fingerprint drift', () => {
    const editor = createEditor({
      migrations,
      schema: EditorSchema,
      skipInitialization: true,
    });
    const current = editor.read.schema.identity();

    expect(() =>
      editor.update.value.replace({
        ...source(1),
        schema: { ...source(1).schema, fingerprint: 'wrong' },
      })
    ).toThrow('does not match migration source');
    expect(() =>
      editor.update.value.replace({
        ...source(1),
        schema: { ...source(1).schema, id: 'other' },
      })
    ).toThrow('does not match migration id');
    expect(() => editor.update.value.replace(source(4))).toThrow(
      'downgrades are not supported'
    );
    expect(() =>
      editor.update.value.replace({
        document: source(3).document,
        schema: { ...current, fingerprint: 'wrong' },
      })
    ).toThrow('does not match current fingerprint');
  });

  it('requires a declared fingerprint for every historical envelope', () => {
    const incomplete = defineDocumentMigrations(EditorSchema, {
      steps: migrations.steps,
      unversioned: 1,
    });
    const editor = createEditor({
      migrations: incomplete,
      schema: EditorSchema,
      skipInitialization: true,
    });

    expect(() => editor.update.value.replace(source(1))).toThrow(
      'Missing source schema fingerprint'
    );
  });

  it('returns an exact no-op for a current persisted document', () => {
    const editor = createEditor({
      migrations,
      schema: EditorSchema,
      skipInitialization: true,
    });
    const input = {
      document: source(3).document,
      schema: editor.read.schema.identity(),
    };
    const result = migrateDocument(input, { editor, migrations });

    expect(result.applied).toEqual([]);
    expect(result.document).toBe(input.document);
  });
});
