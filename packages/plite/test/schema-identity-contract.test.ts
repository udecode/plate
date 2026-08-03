import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  schema,
  type EditorSchemaIdentity,
} from '@platejs/plite';
import {
  compileEditorSchemaContributions,
  EditorSchemaCompileError,
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
