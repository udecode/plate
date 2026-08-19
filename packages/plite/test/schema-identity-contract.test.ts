import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  schema,
  type EditorSchemaIdentity,
} from '@platejs/plite';
import {
  compileEditorSchemaContributions,
  EditorSchemaCompileError,
  setEditorSnapshotInputTransform,
  type EditorSchemaContributionRecord,
} from '@platejs/plite/internal';

const record = (
  extensionName: string,
  contribution: EditorSchemaContributionRecord['contribution']
): EditorSchemaContributionRecord => ({ contribution, extensionName });

describe('schema identity contract', () => {
  it('derives complete schema identity when lineage is omitted', () => {
    const DerivedSchema = defineEditorSchema('schema:derived', {
      elements: {
        paragraph: { content: schema.content.text() },
      },
      root: schema.content.type('paragraph'),
      unknown: 'reject',
    });
    const NamedSchema = defineEditorSchema('schema:article', {
      elements: {
        paragraph: { content: schema.content.text() },
      },
      id: 'article',
      root: schema.content.type('paragraph'),
      unknown: 'reject',
      version: 1,
    });
    const derived = compileEditorSchemaContributions([
      record(DerivedSchema.name, DerivedSchema.schema),
    ]);
    const named = compileEditorSchemaContributions([
      record(NamedSchema.name, NamedSchema.schema),
    ]);
    const editor = createEditor({
      extensions: [DerivedSchema],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const name: 'schema:derived' = DerivedSchema.name;

    assert.equal(name, 'schema:derived');
    assert.equal(Object.hasOwn(DerivedSchema.schema, 'identity'), false);
    assert.deepEqual(derived.identity, {
      fingerprint: derived.identity.fingerprint,
      kind: 'derived',
    });
    assert.equal(named.identity.kind, 'named');
    assert.equal(named.identity.fingerprint, derived.identity.fingerprint);
    assert.deepEqual(editor.read.schema.identity(), derived.identity);
  });

  it('always publishes one non-null raw editor identity', () => {
    const editor = createEditor();
    const identity: EditorSchemaIdentity = editor.read.schema.identity();

    assert.equal(identity.kind, 'derived');
    assert.equal(identity.fingerprint.length > 0, true);
  });

  it('treats the primary root as complete-schema ownership with closed defaults', () => {
    const compiled = compileEditorSchemaContributions([
      record('closed-defaults', {
        elements: { paragraph: schema.element.textBlock() },
        root: schema.content.type('paragraph'),
      }),
    ]);

    assert.equal(compiled.identity.kind, 'derived');
    assert.equal(compiled.unknown, 'reject');
  });

  it('requires named lineage fields together', () => {
    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record('missing-id', {
            elements: {},
            root: schema.content.open(),
            unknown: 'preserve',
            version: 1,
          } as unknown as EditorSchemaContributionRecord['contribution']),
        ]),
      (error: unknown) => {
        assert.ok(error instanceof EditorSchemaCompileError);
        assert.deepEqual(error.diagnostics, [
          {
            code: 'missing-complete-schema-field',
            extensions: ['missing-id'],
            message:
              'Named schema definition "missing-id" must own schema field "id".',
            path: 'schema.id',
          },
        ]);

        return true;
      }
    );
  });

  it('accepts an exact persisted envelope and rejects stale lineage before fitting', () => {
    const ArticleSchema = defineEditorSchema('schema:article-envelope', {
      elements: { paragraph: schema.element.textBlock() },
      id: 'article-envelope',
      root: schema.content.type('paragraph'),
      version: 2,
    });
    const editor = createEditor({
      extensions: [ArticleSchema],
      initialValue: [{ children: [{ text: 'before' }], type: 'paragraph' }],
    });
    const document = {
      children: [{ children: [{ text: 'after' }], type: 'paragraph' }],
    } as const;

    editor.update.value.replace({
      document,
      schema: editor.read.schema.identity(),
    });
    assert.equal(editor.read.children()[0]?.children[0]?.text, 'after');
    assert.throws(
      () =>
        editor.update.value.replace({
          document: { ...document, selection: 'end' } as never,
          schema: editor.read.schema.identity(),
        }),
      /Persisted document field "selection" is not supported/
    );
    assert.throws(
      () =>
        editor.update.value.replace({
          document,
          schema: editor.read.schema.identity(),
          sourceVersion: 2,
        } as never),
      /Persisted document envelope field "sourceVersion" is not supported/
    );
    assert.throws(
      () =>
        editor.update.value.replace({
          document,
          schema: {
            ...editor.read.schema.identity(),
            sourceVersion: 2,
          },
        } as never),
      /Persisted document schema field "sourceVersion" is not supported/
    );
    assert.throws(
      () =>
        editor.update.value.replace({
          document,
          schema: {
            ...editor.read.schema.identity(),
            fingerprint: 'stale',
          },
        }),
      /does not match current schema/
    );
  });

  it('does not confuse direct snapshots with application document metadata', () => {
    const editor = createEditor();

    editor.update.value.replace({
      children: [{ children: [{ text: 'after' }], type: 'paragraph' }],
      document: { application: true },
    } as never);

    assert.equal(editor.read.text.string([]), 'after');
  });

  it('rejects persisted envelopes with unsupported direct snapshot fields', () => {
    const editor = createEditor();

    assert.throws(
      () =>
        editor.update.value.replace({
          children: [],
          document: { children: [] },
          schema: editor.read.schema.identity(),
        } as never),
      /Persisted document envelope field "children" is not supported/
    );
  });

  it('rejects persisted envelopes from views before host transforms run', () => {
    const editor = createEditor();
    const view = createEditorView(editor);
    const envelope = {
      document: {
        children: [{ children: [{ text: 'after' }], type: 'paragraph' }],
      },
      schema: editor.read.schema.identity(),
    } as const;
    const restore = setEditorSnapshotInputTransform(editor, (input) =>
      typeof input === 'object' && input && 'document' in input
        ? input.document
        : input
    );

    assert.throws(
      () => view.update.value.replace(envelope),
      /can replace only the complete editor/
    );
    restore();

    const restoreEnvelopeTransform = setEditorSnapshotInputTransform(
      editor,
      (input) =>
        ({
          document: {
            children: (input as { children: unknown }).children,
          },
          schema: editor.read.schema.identity(),
        }) as never
    );

    assert.throws(
      () =>
        view.update.value.replace({
          children: [
            { children: [{ text: 'transformed' }], type: 'paragraph' },
          ],
        }),
      /can replace only the complete editor/
    );
    restoreEnvelopeTransform();
  });

  it('rejects multiple root-owning schema definitions', () => {
    const complete = (id?: string) => ({
      elements: {},
      ...(id ? { id, version: 1 } : {}),
      root: schema.content.open(),
      unknown: 'preserve' as const,
    });

    assert.throws(
      () =>
        compileEditorSchemaContributions([
          record(
            'derived',
            complete() as EditorSchemaContributionRecord['contribution']
          ),
          record(
            'named',
            complete(
              'article'
            ) as EditorSchemaContributionRecord['contribution']
          ),
        ]),
      (error: unknown) => {
        assert.ok(error instanceof EditorSchemaCompileError);
        assert.deepEqual(error.diagnostics, [
          {
            code: 'duplicate-complete-schema',
            extensions: ['derived', 'named'],
            message:
              'Schema contributions contain multiple complete schemas: derived, named.',
            path: 'schema',
          },
        ]);

        return true;
      }
    );
  });
});
