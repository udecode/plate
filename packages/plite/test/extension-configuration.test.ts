import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runInNewContext } from 'node:vm';

import {
  createEditor,
  defineCommand,
  defineExtension,
  defineEditorSchema,
  defineEffect,
  defineExtensionSlot,
  defineFacet,
  defineStateField,
  defineValueCodec,
  ElementApi,
  EditorExtensionPublicationError,
  editorCommands,
  property,
  schema,
  type Editor,
  type EditorExtensionDefinitionInput,
  type EditorExtensionReference,
  type EditorSchemaIdentity,
} from '@platejs/plite';
import {
  compileEditorExtension,
  dispatchCommand,
  getCompiledEditorConfiguration,
  getEditorExtensionRegistry,
  getInstalledEditorExtensionApi,
  getInstalledEditorExtension,
  initializeEditorExtensions,
} from '@platejs/plite/internal';

import { prepareEditorExtensionPublication } from '../src/core/editor-extension';
import { applyTransactionSpec } from '../src/core/public-state';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const namedIdentity = (identity: EditorSchemaIdentity) => {
  assert.equal(identity.kind, 'named');

  if (identity.kind !== 'named') assert.fail('Expected named schema identity');

  return identity;
};

describe('transactional extension configuration', () => {
  it('calls schema factories with only the extension name', () => {
    let receivedContext: unknown;

    defineExtension('schema-factory-context', {
      schema(context) {
        receivedContext = context;

        return { elements: { image: { void: 'block' } } };
      },
    });

    assert.deepEqual(receivedContext, { name: 'schema-factory-context' });
    assert.deepEqual(Reflect.ownKeys(receivedContext as object), ['name']);
    assert.equal(Object.isFrozen(receivedContext), true);
  });

  it('composes partial schema contributions over the derived base schema', () => {
    const imageExtension = defineExtension('partial-image-schema', {
      schema: { elements: { image: { void: 'block' } } },
    });
    const derivedEditor = createEditor({ extensions: [imageExtension] });

    assert.equal(derivedEditor.read.schema.identity().kind, 'derived');
    assert.equal(
      derivedEditor.read.schema.element('image')?.behavior.voidKind,
      'block'
    );
    assert.equal(
      getEditorExtensionRegistry(derivedEditor).schemaContributions.records
        .size,
      1
    );

    const documentSchema = defineEditorSchema(
      'schema:explicit-schema-composition-owner',
      {
        elements: {},
        id: 'explicit-schema-composition-owner',
        root: schema.content.not(schema.content.text()),
        unknown: 'preserve',
        version: 1,
      }
    );
    const editor = createEditor({
      extensions: [documentSchema, imageExtension],
    });

    assert.equal(
      namedIdentity(editor.read.schema.identity()).id,
      'explicit-schema-composition-owner'
    );
    assert.equal(
      editor.read.schema.element('image')?.behavior.voidKind,
      'block'
    );
  });

  it('bootstraps one complete schema only on an unchanged editor', () => {
    const articleSchema = defineEditorSchema(
      'schema:one-shot-schema-bootstrap',
      {
        elements: {
          paragraph: {
            content: schema.content.text({ default: 'text', min: 1 }),
          },
        },
        id: 'one-shot-schema-bootstrap',
        root: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      }
    );
    const editor = createEditor({
      extensions: [defineExtension('pre-schema-runtime-extension', {})],
    });
    let commits = 0;

    editor.subscribeCommit(() => (commits += 1) - 1);
    initializeEditorExtensions(editor, articleSchema);

    assert.deepEqual(editor.read.children(), [paragraph('')]);
    assert.equal(
      namedIdentity(editor.read.schema.identity()).id,
      'one-shot-schema-bootstrap'
    );
    assert.equal(editor.read.lastCommit(), null);
    assert.equal(commits, 0);
    assert.throws(
      () => initializeEditorExtensions(editor, articleSchema),
      /without an installed schema|already initialized/u
    );

    const updated = createEditor();

    updated.update((tx) => tx.nodes.insert(paragraph('written')));
    updated.install(defineExtension('post-document-runtime-extension', {}));
    assert.throws(
      () => initializeEditorExtensions(updated, articleSchema),
      /unchanged document/u
    );
  });

  it('restores a failed schema bootstrap and permits one clean retry', () => {
    let allowPublishedDocument = false;
    let editor: ReturnType<typeof createEditor> | undefined;
    const articleSchema = defineEditorSchema(
      'schema:retryable-schema-bootstrap',
      {
        elements: {
          paragraph: {
            content: schema.content.text({ default: 'text', min: 1 }),
            properties: {
              guard: property.json({
                default: 'valid',
                validate: (value): value is string =>
                  typeof value === 'string' &&
                  (allowPublishedDocument ||
                    !editor ||
                    editor.read.children().length === 0),
                validationVersion: 1,
              }),
            },
          },
        },
        id: 'retryable-schema-bootstrap',
        root: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      }
    );

    editor = createEditor();
    const derivedIdentity = editor.read.schema.identity();

    assert.equal(derivedIdentity?.kind, 'derived');

    assert.throws(() => {
      initializeEditorExtensions(editor, articleSchema);
    }, /guard/u);
    assert.deepEqual(editor.read.value(), { children: [] });
    assert.equal(editor.read.selection(), null);
    assert.equal(editor.read.schema.identity(), derivedIdentity);
    assert.equal(editor.read.lastCommit(), null);

    allowPublishedDocument = true;
    initializeEditorExtensions(editor, articleSchema);

    assert.deepEqual(editor.read.children(), [
      {
        children: [{ text: '' }],
        guard: 'valid',
        type: 'paragraph',
      },
    ]);
    assert.equal(editor.read.selection(), null);
    assert.equal(
      namedIdentity(editor.read.schema.identity()).id,
      'retryable-schema-bootstrap'
    );
    assert.equal(editor.read.lastCommit(), null);
  });

  it('rolls back initializer drafts before publishing bootstrap state', () => {
    const articleSchema = defineEditorSchema(
      'schema:atomic-initializer-bootstrap',
      {
        elements: {
          paragraph: { content: schema.content.text() },
        },
        id: 'atomic-initializer-bootstrap',
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      }
    );
    const bootstrapOwner = defineExtension('bootstrap-atomic-owner', {});
    const initialSelection = {
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
      kind: 'text' as const,
    };
    const editor = createEditor({
      initialSelection,
      initialValue: [paragraph('before')],
    });
    const previousIdentity = editor.read.schema.identity();
    const previousRegistry = getEditorExtensionRegistry(editor);
    const previousVersion = editor.read.runtime.snapshot().version;
    let commits = 0;

    editor.subscribeCommit(() => {
      commits += 1;
      throw new Error('bootstrap must not publish a commit');
    });

    assert.throws(
      () =>
        initializeEditorExtensions(editor, [articleSchema, bootstrapOwner], {
          initialize(tx) {
            tx.value.replace({
              children: [paragraph('after')],
              selection: null,
            });
            throw new Error('bootstrap initializer failed after replacement');
          },
        }),
      /bootstrap initializer failed after replacement/u
    );

    assert.equal(getEditorExtensionRegistry(editor), previousRegistry);
    assert.equal(editor.read.schema.identity(), previousIdentity);
    assert.deepEqual(editor.read.children(), [paragraph('before')]);
    assert.deepEqual(editor.read.selection(), {
      anchor: initialSelection.anchor,
      focus: initialSelection.focus,
    });
    assert.equal(editor.read.lastCommit(), null);
    assert.equal(editor.read.runtime.snapshot().version, previousVersion);
    assert.equal(commits, 0);
    assert.equal(
      getInstalledEditorExtension(editor, 'bootstrap-atomic-owner'),
      undefined
    );

    initializeEditorExtensions(editor, [articleSchema, bootstrapOwner], {
      initialize(tx) {
        tx.value.replace({
          children: [paragraph('after')],
          selection: null,
        });
      },
    });

    assert.equal(
      namedIdentity(editor.read.schema.identity()).id,
      'atomic-initializer-bootstrap'
    );
    assert.deepEqual(editor.read.children(), [paragraph('after')]);
    assert.equal(editor.read.lastCommit(), null);
    assert.equal(commits, 0);
  });

  it('invalidates specs minted before one successful schema bootstrap', () => {
    const articleSchema = defineEditorSchema('schema:bootstrap-spec-success', {
      elements: {
        paragraph: { content: schema.content.text() },
      },
      id: 'bootstrap-spec-success',
      root: schema.content.type('paragraph'),
      unknown: 'reject',
      version: 1,
    });
    const editor = createEditor({ initialValue: [paragraph('a')] });
    const spec = editor.read((state) =>
      state.transaction((tx) => {
        tx.text.insert('x', { at: { offset: 1, path: [0, 0] } });
      })
    );
    const previousVersion = editor.read.runtime.snapshot().version;

    initializeEditorExtensions(editor, articleSchema);

    assert.equal(editor.read.runtime.snapshot().version, previousVersion);
    assert.equal(editor.read.lastCommit(), null);
    assert.throws(
      () => editor.update(() => applyTransactionSpec(editor, spec)),
      /stale transaction spec/u
    );
    assert.deepEqual(editor.read.children(), [paragraph('a')]);
  });

  it('adopts one fitted initial snapshot without publishing a live commit', () => {
    const articleSchema = defineEditorSchema(
      'schema:direct-initial-snapshot-bootstrap',
      {
        elements: {
          paragraph: { content: schema.content.text() },
        },
        id: 'direct-initial-snapshot-bootstrap',
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      }
    );
    const persisted = defineStateField({
      key: 'direct-initial-snapshot-field',
      persist: defineValueCodec<string>({
        decode: (value) => `decoded:${String(value)}`,
        encode: (value) => value,
        version: 1,
      }),
    });
    const stateOwner = defineExtension('direct-initial-snapshot-state', {
      stateFields: [persisted],
    });
    const editor = createEditor();
    const previousVersion = editor.read.runtime.snapshot().version;
    let commits = 0;

    editor.subscribeCommit(() => (commits += 1) - 1);
    initializeEditorExtensions(editor, [articleSchema, stateOwner], {
      initialValue: () => ({
        children: [{ text: 'wrapped' }],
        meta: { [persisted.key]: { value: 'stored', version: 1 } },
        selection: {
          kind: 'text',
          anchor: { offset: 3, path: [0] },
          focus: { offset: 3, path: [0] },
        },
      }),
    });

    assert.deepEqual(editor.read.children(), [paragraph('wrapped')]);
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
    assert.equal(editor.read.getField(persisted), 'decoded:stored');
    assert.equal(editor.read.lastCommit(), null);
    assert.equal(editor.read.runtime.snapshot().version, previousVersion);
    assert.equal(commits, 0);
  });

  it('preserves specs when schema bootstrap rolls back', () => {
    const articleSchema = defineEditorSchema('schema:bootstrap-spec-failure', {
      elements: {
        paragraph: { content: schema.content.text() },
      },
      id: 'bootstrap-spec-failure',
      root: schema.content.type('paragraph'),
      unknown: 'reject',
      version: 1,
    });
    const editor = createEditor({ initialValue: [paragraph('a')] });
    const spec = editor.read((state) =>
      state.transaction((tx) => {
        tx.text.insert('x', { at: { offset: 1, path: [0, 0] } });
      })
    );
    const previousVersion = editor.read.runtime.snapshot().version;

    assert.throws(
      () =>
        initializeEditorExtensions(editor, articleSchema, {
          initialize() {
            throw new Error('bootstrap transaction abort');
          },
        }),
      /bootstrap transaction abort/u
    );

    assert.equal(editor.read.runtime.snapshot().version, previousVersion);
    assert.equal(editor.read.lastCommit(), null);
    editor.update(() => applyTransactionSpec(editor, spec));
    assert.deepEqual(editor.read.children(), [paragraph('ax')]);
  });

  it('rejects active anchors before staging schema bootstrap state', () => {
    const articleSchema = defineEditorSchema('schema:anchor-free-bootstrap', {
      elements: {
        paragraph: { content: schema.content.text() },
      },
      id: 'anchor-free-bootstrap',
      root: schema.content.type('paragraph'),
      unknown: 'reject',
      version: 1,
    });
    const editor = createEditor({ initialValue: [paragraph('before')] });
    const previousIdentity = editor.read.schema.identity();
    const previousRegistry = getEditorExtensionRegistry(editor);
    const previousVersion = editor.read.runtime.snapshot().version;
    const anchor = editor.anchor([0], { deletion: 'nearest' });

    assert.throws(
      () => initializeEditorExtensions(editor, articleSchema),
      /without active anchors/u
    );
    assert.equal(getEditorExtensionRegistry(editor), previousRegistry);
    assert.equal(editor.read.schema.identity(), previousIdentity);
    assert.deepEqual(editor.read.children(), [paragraph('before')]);
    assert.equal(editor.read.lastCommit(), null);
    assert.equal(editor.read.runtime.snapshot().version, previousVersion);
    assert.deepEqual(anchor.release(), [0]);

    initializeEditorExtensions(editor, articleSchema);

    assert.equal(
      namedIdentity(editor.read.schema.identity()).id,
      'anchor-free-bootstrap'
    );
  });

  it('rejects bootstrap transaction metadata that has no commit owner', () => {
    const articleSchema = defineEditorSchema('schema:metadata-free-bootstrap', {
      elements: {
        paragraph: { content: schema.content.text() },
      },
      id: 'metadata-free-bootstrap',
      root: schema.content.type('paragraph'),
      unknown: 'reject',
      version: 1,
    });
    const effect = defineEffect<string>({ key: 'bootstrap.effect' });
    const effectOwner = defineExtension('bootstrap-effect-owner', {
      effectTypes: [effect],
    });
    const editor = createEditor({ initialValue: [paragraph('before')] });
    const previousRegistry = getEditorExtensionRegistry(editor);

    assert.throws(
      () =>
        initializeEditorExtensions(editor, [articleSchema, effectOwner], {
          initialize(tx) {
            tx.effects.emit(effect, 'unsupported');
          },
        }),
      /cannot publish effects, annotations, or tags/u
    );
    assert.equal(getEditorExtensionRegistry(editor), previousRegistry);
    assert.deepEqual(editor.read.children(), [paragraph('before')]);
    assert.equal(editor.read.lastCommit(), null);
    assert.equal(
      getInstalledEditorExtension(editor, 'bootstrap-effect-owner'),
      undefined
    );
  });

  it('validates explicit initial documents without rewriting them', () => {
    const articleSchema = defineEditorSchema(
      'schema:explicit-schema-bootstrap',
      {
        elements: {
          paragraph: { content: schema.content.text() },
        },
        id: 'explicit-schema-bootstrap',
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      }
    );

    assert.throws(
      () =>
        createEditor({
          extensions: [articleSchema],
          initialValue: [
            { children: [{ text: 'must reject' }], type: 'external' },
          ],
        }),
      /external/u
    );

    const explicitEditor = createEditor({
      initialValue: [paragraph('preserve')],
    });

    initializeEditorExtensions(explicitEditor, articleSchema);

    assert.deepEqual(explicitEditor.read.children(), [paragraph('preserve')]);
    assert.equal(
      namedIdentity(explicitEditor.read.schema.identity()).id,
      'explicit-schema-bootstrap'
    );
  });

  it('publishes a dynamic extension migration and schema atomically', () => {
    const articleSchema = defineEditorSchema(
      'schema:dynamic-schema-migration',
      {
        elements: {
          paragraph: {
            content: schema.content.text({ default: 'text', min: 1 }),
          } as const,
        },
        id: 'dynamic-schema-migration',
        root: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      }
    );
    const editor = createEditor();
    const derivedIdentity = editor.read.schema.identity();
    const observations: Array<{
      children: unknown;
      schema: ReturnType<typeof editor.read.schema.identity>;
    }> = [];

    editor.subscribeCommit(() => {
      observations.push({
        children: editor.read.children(),
        schema: editor.read.schema.identity(),
      });
    });

    assert.throws(
      () => editor.install(articleSchema),
      /requires an explicit migration/u
    );
    assert.deepEqual(editor.read.children(), []);
    assert.equal(editor.read.schema.identity(), derivedIdentity);
    assert.deepEqual(observations, []);

    editor.install(articleSchema, {
      migrate({ document, next }) {
        const child = next.createDefaultRootChild();

        assert.ok(child && ElementApi.isElement(child));

        return { ...document, children: [child] };
      },
    });

    const identity = editor.read.schema.identity();

    assert.deepEqual(editor.read.children(), [paragraph('')]);
    assert.equal(namedIdentity(identity).id, 'dynamic-schema-migration');
    assert.deepEqual(observations, [
      {
        children: [paragraph('')],
        schema: identity,
      },
    ]);
    assert.equal(editor.read.lastCommit()?.changes.empty, false);
    assert.equal(
      editor.read.lastCommit()?.dirtyStateKeys.includes('$configuration'),
      true
    );
  });

  it('publishes candidate schema migration and document as one commit', () => {
    const slot = defineExtensionSlot('atomic-schema-migration');
    const articleSchema = (version: number, type: string) =>
      defineEditorSchema('schema:atomic-schema-migration', {
        elements: {
          [type]: {
            content: schema.content.text({ default: 'text', min: 1 }),
          } as const,
        },
        id: 'atomic-schema-migration',
        root: schema.content.type(type, {
          default: { type },
          min: 1,
        }),
        unknown: 'reject',
        version,
      });
    const beforeSchema = articleSchema(1, 'paragraph');
    const afterSchema = articleSchema(2, 'heading');
    const editor = createEditor({
      extensions: [slot.of(beforeSchema)] as const,
      initialValue: [paragraph('before')],
    });
    const schemaFacade = editor.read((state) => state.schema);
    assert.deepEqual(
      schemaFacade.fitDocument({
        children: [paragraph('compiled-before')],
      }).children,
      [paragraph('compiled-before')]
    );
    const beforeRevision = getCompiledEditorConfiguration(editor).revision;
    const commits: number[] = [];
    const observerStates: Array<{
      children: unknown;
      configurationRevision: number;
      schema: ReturnType<typeof editor.read.schema.identity>;
    }> = [];

    editor.subscribeCommit((commit) => {
      commits.push(commit.version);
      observerStates.push({
        children: editor.read.children(),
        configurationRevision: getCompiledEditorConfiguration(editor).revision,
        schema: editor.read.schema.identity(),
      });
    });
    assert.throws(
      () => editor.update.extensions.reconfigure(slot, afterSchema),
      /unknown editor element type "paragraph"/i
    );
    assert.equal(namedIdentity(editor.read.schema.identity()).version, 1);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      beforeRevision
    );
    assert.deepEqual(editor.read.children(), [paragraph('before')]);
    assert.deepEqual(commits, []);

    editor.update.extensions.reconfigure(slot, afterSchema, {
      migrate({ document, next }) {
        assert.equal(namedIdentity(editor.read.schema.identity()).version, 1);
        assert.equal(namedIdentity(next.identity()).version, 2);

        return {
          ...document,
          children: [
            {
              ...document.children[0],
              type: 'heading',
            },
          ],
        };
      },
    });

    assert.equal(namedIdentity(editor.read.schema.identity()).version, 2);
    assert.equal(
      editor.read((state) => state.schema),
      schemaFacade
    );
    assert.equal(namedIdentity(schemaFacade.identity()).version, 2);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      beforeRevision + 1
    );
    const publishedIdentity = editor.read.schema.identity();

    assert.equal(
      namedIdentity(publishedIdentity).id,
      'atomic-schema-migration'
    );
    assert.equal(namedIdentity(publishedIdentity).version, 2);
    assert.match(publishedIdentity?.fingerprint ?? '', /^fnv1a64:/u);
    assert.deepEqual(editor.read.children(), [
      { children: [{ text: 'before' }], type: 'heading' },
    ]);
    assert.throws(
      () =>
        schemaFacade.fitDocument({
          children: [paragraph('stale-fitter')],
        }),
      /unknown editor element type "paragraph"/i
    );
    assert.deepEqual(
      schemaFacade.fitDocument({
        children: [{ children: [{ text: 'current-fitter' }], type: 'heading' }],
      }).children,
      [{ children: [{ text: 'current-fitter' }], type: 'heading' }]
    );
    assert.deepEqual(commits, [1]);
    assert.deepEqual(observerStates, [
      {
        children: [{ children: [{ text: 'before' }], type: 'heading' }],
        configurationRevision: beforeRevision + 1,
        schema: publishedIdentity,
      },
    ]);
    assert.equal(editor.read.lastCommit()?.changes.empty, false);
    assert.deepEqual(
      editor.read.lastCommit()?.inverseChanges.apply({
        children: editor.read.children(),
      }),
      { children: [paragraph('before')] }
    );
    assert.equal(
      editor.read.lastCommit()?.dirtyStateKeys.includes('$configuration'),
      true
    );
  });

  it('retains earlier document writes across a schema-revision migration', () => {
    const slot = defineExtensionSlot('schema-migration-after-write');
    const articleSchema = (version: number, type: string) =>
      defineEditorSchema('schema:schema-migration-after-write', {
        elements: {
          [type]: {
            content: schema.content.text({ default: 'text', min: 1 }),
          } as const,
        },
        id: 'schema-migration-after-write',
        root: schema.content.type(type, {
          default: { type },
          min: 1,
        }),
        unknown: 'reject',
        version,
      });
    const before = articleSchema(1, 'paragraph');
    const after = articleSchema(2, 'heading');
    const editor = createEditor({
      extensions: [slot.of(before)] as const,
      initialValue: [paragraph('before')],
    });

    editor.update((tx) => {
      tx.text.insert('!', { at: { offset: 6, path: [0, 0] } });
      tx.extensions.reconfigure(slot, after, {
        migrate({ document }) {
          return {
            ...document,
            children: [
              {
                ...document.children[0],
                type: 'heading',
              },
            ],
          };
        },
      });
    });

    assert.deepEqual(editor.read.children(), [
      { children: [{ text: 'before!' }], type: 'heading' },
    ]);
    assert.deepEqual(
      editor.read.lastCommit()?.inverseChanges.apply({
        children: editor.read.children(),
      }),
      { children: [paragraph('before')] }
    );
    assert.equal(editor.read.lastCommit()?.version, 1);
  });

  it('rolls back failed candidate schema migrations completely', () => {
    const slot = defineExtensionSlot('failed-schema-migration');
    const effect = defineEffect<string>({
      key: 'failed-schema-migration.effect',
    });
    const articleSchema = (version: number, type: string) =>
      defineEditorSchema('schema:failed-schema-migration', {
        elements: {
          [type]: {
            content: schema.content.text({ default: 'text', min: 1 }),
          } as const,
        },
        id: 'failed-schema-migration',
        root: schema.content.type(type, {
          default: { type },
          min: 1,
        }),
        unknown: 'reject',
        version,
      });
    const editor = createEditor({
      extensions: [
        slot.of(articleSchema(1, 'paragraph')),
        defineExtension('failed-schema-migration-effect', {
          effectTypes: [effect],
        }),
      ] as const,
      initialValue: [paragraph('before')],
    });
    const previousRegistry = getEditorExtensionRegistry(editor);
    const previousRevision = getCompiledEditorConfiguration(editor).revision;
    let commits = 0;

    editor.subscribeCommit(() => (commits += 1) - 1);

    assert.throws(
      () =>
        editor.update.extensions.reconfigure(
          slot,
          articleSchema(2, 'heading'),
          {
            migrate() {
              throw new Error('migration failed');
            },
          }
        ),
      /migration failed/
    );
    assert.throws(
      () =>
        editor.update.extensions.reconfigure(
          slot,
          articleSchema(2, 'heading'),
          {
            migrate({ document }) {
              return document;
            },
          }
        ),
      /unknown editor element type "paragraph"/i
    );
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.text.insert('!', { at: { offset: 6, path: [0, 0] } });
          tx.effects.emit(effect, 'must-not-publish');
          tx.extensions.reconfigure(slot, articleSchema(2, 'heading'), {
            migrate() {
              throw new Error('migration failed after prior writes');
            },
          });
        }),
      /migration failed after prior writes/
    );

    assert.equal(getEditorExtensionRegistry(editor), previousRegistry);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      previousRevision
    );
    assert.equal(namedIdentity(editor.read.schema.identity()).version, 1);
    assert.deepEqual(editor.read.children(), [paragraph('before')]);
    assert.equal(editor.read.lastCommit(), null);
    assert.equal(commits, 0);
  });

  it('treats the exact same complete schema descriptor as a no-op', () => {
    const slot = defineExtensionSlot('equivalent-schema-migration');
    const createSchema = () =>
      defineEditorSchema('schema:equivalent-schema-migration', {
        elements: {
          paragraph: {
            content: schema.content.text({ default: 'text', min: 1 }),
          } as const,
        },
        id: 'equivalent-schema-migration',
        root: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      });
    const schemaExtension = createSchema();
    const editor = createEditor({
      extensions: [slot.of(schemaExtension)] as const,
      initialValue: [paragraph('same')],
    });
    const identity = editor.read.schema.identity();
    const configurationRevision =
      getCompiledEditorConfiguration(editor).revision;
    const { schemaRevision } = getEditorExtensionRegistry(editor);
    let migrations = 0;
    let commits = 0;

    editor.subscribeCommit(() => (commits += 1) - 1);
    editor.update.extensions.reconfigure(slot, schemaExtension, {
      migrate({ document }) {
        migrations += 1;
        return document;
      },
    });

    assert.equal(migrations, 0);
    assert.equal(commits, 0);
    assert.equal(editor.read.schema.identity(), identity);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      configurationRevision
    );
    assert.equal(
      getEditorExtensionRegistry(editor).schemaRevision,
      schemaRevision
    );
    assert.equal(editor.read.lastCommit(), null);
  });

  it('publishes a fresh descriptor even when schema grammar is equivalent', () => {
    const slot = defineExtensionSlot('equivalent-schema-order');
    const articleSchema = (groups: readonly string[]) =>
      defineEditorSchema('schema:equivalent-schema-order', {
        elements: {
          paragraph: {
            content: schema.content.text(),
            groups,
          },
        },
        groups: {
          article: { extends: ['block'] },
          section: { extends: ['block'] },
        },
        id: 'equivalent-schema-order',
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      });
    const editor = createEditor({
      extensions: [slot.of(articleSchema(['article', 'section']))] as const,
      initialValue: [paragraph('same')],
    });
    const identity = editor.read.schema.identity();
    const configurationRevision =
      getCompiledEditorConfiguration(editor).revision;
    const { schemaRevision } = getEditorExtensionRegistry(editor);
    let commits = 0;

    editor.subscribeCommit(() => (commits += 1) - 1);
    editor.update.extensions.reconfigure(
      slot,
      articleSchema(['section', 'article'])
    );

    assert.equal(commits, 1);
    assert.equal(editor.read.schema.identity(), identity);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      configurationRevision + 1
    );
    assert.equal(
      getEditorExtensionRegistry(editor).schemaRevision,
      schemaRevision
    );
    assert.notEqual(editor.read.lastCommit(), null);
  });

  it('publishes equal-schema non-schema changes without migration', () => {
    const mode = defineFacet<string, string>({
      combine: (values) => values.at(-1) ?? 'missing',
      key: 'equal-schema-non-schema-mode',
    });
    const slot = defineExtensionSlot('equal-schema-non-schema');
    const createSchema = () =>
      defineEditorSchema('schema:equal-schema-non-schema', {
        elements: {
          paragraph: { content: schema.content.text() },
        },
        id: 'equal-schema-non-schema',
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      }).schema;
    const extension = (value: string) =>
      defineExtension('equal-schema-non-schema', {
        facetProviders: [mode.of(value)],
        schema: createSchema(),
      });
    const editor = createEditor({
      extensions: [slot.of(extension('read'))] as const,
      initialValue: [paragraph('same')],
    });
    const identity = editor.read.schema.identity();
    const configurationRevision =
      getCompiledEditorConfiguration(editor).revision;
    const { schemaRevision } = getEditorExtensionRegistry(editor);
    const observations: Array<{
      mode: string;
      revision: number;
      schemaRevision: number;
    }> = [];
    let migrations = 0;

    editor.subscribeCommit(() => {
      observations.push({
        mode: editor.read.facet(mode),
        revision: getCompiledEditorConfiguration(editor).revision,
        schemaRevision: getEditorExtensionRegistry(editor).schemaRevision,
      });
    });
    editor.update.extensions.reconfigure(slot, extension('write'), {
      migrate({ document }) {
        migrations += 1;
        return document;
      },
    });

    assert.equal(migrations, 0);
    assert.equal(editor.read.facet(mode), 'write');
    assert.equal(editor.read.schema.identity(), identity);
    assert.deepEqual(observations, [
      {
        mode: 'write',
        revision: configurationRevision + 1,
        schemaRevision,
      },
    ]);
  });

  it('publishes same-schema setup and API replacements', () => {
    const schemaDeclaration = defineEditorSchema(
      'schema:same-schema-runtime-resources',
      {
        elements: {
          paragraph: { content: schema.content.text() },
        },
        id: 'same-schema-runtime-resources',
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      }
    ).schema;
    const assertPublishes = (
      slotName: string,
      initial: EditorExtensionReference,
      replacement: EditorExtensionReference,
      verify: (editor: Editor<any, any>) => void
    ) => {
      const slot = defineExtensionSlot(slotName);
      const editor = createEditor({
        extensions: [slot.of(initial)],
        initialValue: [paragraph('same')],
      });
      const identity = editor.read.schema.identity();
      const configurationRevision =
        getCompiledEditorConfiguration(editor).revision;
      const { schemaRevision } = getEditorExtensionRegistry(editor);
      let commits = 0;

      editor.subscribeCommit(() => (commits += 1) - 1);
      editor.update.extensions.reconfigure(slot, replacement);

      assert.equal(commits, 1);
      assert.equal(editor.read.schema.identity(), identity);
      assert.equal(
        getCompiledEditorConfiguration(editor).revision,
        configurationRevision + 1
      );
      assert.equal(
        getEditorExtensionRegistry(editor).schemaRevision,
        schemaRevision
      );
      verify(editor);
    };
    const setupLifecycle: string[] = [];
    const setupExtension = (mode: string) =>
      defineExtension('same-schema-setup', {
        activate(context) {
          setupLifecycle.push(`activate:${mode}`);
          context.onCleanup(() => setupLifecycle.push(`cleanup:${mode}`));
        },
        schema: schemaDeclaration,
      });

    assertPublishes(
      'same-schema-setup-slot',
      setupExtension('read'),
      setupExtension('write'),
      () =>
        assert.deepEqual(setupLifecycle, [
          'activate:read',
          'activate:write',
          'cleanup:read',
        ])
    );
    assertPublishes(
      'same-schema-api-slot',
      defineExtension('same-schema-api', {
        api: () => ({ value: 'read' }),
        schema: schemaDeclaration,
      }),
      defineExtension('same-schema-api', {
        api: () => ({ value: 'write' }),
        schema: schemaDeclaration,
      }),
      (editor) =>
        assert.equal(
          (editor.api as { 'same-schema-api'?: { value: string } })[
            'same-schema-api'
          ]?.value,
          'write'
        )
    );
  });

  it('reports only semantically changed schema resources', () => {
    const slot = defineExtensionSlot('semantic-schema-delta');
    const articleSchema = (version: number, paragraphReadOnly: boolean) =>
      defineEditorSchema('schema:semantic-schema-delta', {
        elements: {
          heading: { content: schema.content.text() },
          paragraph: {
            content: schema.content.text(),
            readOnly: paragraphReadOnly,
          },
        },
        id: 'semantic-schema-delta',
        root: schema.content.types(['heading', 'paragraph']),
        unknown: 'reject',
        version,
      });
    const editor = createEditor({
      extensions: [slot.of(articleSchema(1, false))] as const,
      initialValue: [paragraph('same')],
    });

    editor.update.extensions.reconfigure(slot, articleSchema(2, true), {
      migrate: ({ document }) => document,
    });

    assert.deepEqual(editor.read.schema.delta(), {
      constructionTypes: [],
      elementTypes: ['paragraph'],
      propertyIds: [],
      roots: [],
    });
  });

  it('rebinds live validators without treating function identity as schema data', () => {
    const slot = defineExtensionSlot('schema-validation-rebind');
    const articleSchema = (accepted: string) =>
      defineEditorSchema('schema:schema-validation-rebind', {
        elements: {
          paragraph: {
            content: schema.content.text(),
            properties: {
              tone: property.json({
                validate: (value): value is string => value === accepted,
                validationVersion: 1,
              }),
            },
          },
        },
        id: 'schema-validation-rebind',
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      });
    const editor = createEditor({
      extensions: [slot.of(articleSchema('old'))] as const,
      initialValue: [paragraph('same')],
    });
    const configurationRevision =
      getCompiledEditorConfiguration(editor).revision;
    const { schemaRevision } = getEditorExtensionRegistry(editor);
    let commits = 0;

    editor.subscribeCommit(() => (commits += 1) - 1);
    editor.update.extensions.reconfigure(slot, articleSchema('new'), {
      migrate: ({ document }) => document,
    });

    assert.equal(commits, 1);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      configurationRevision + 1
    );
    assert.equal(
      getEditorExtensionRegistry(editor).schemaRevision,
      schemaRevision
    );
    assert.equal(editor.read.schema.delta(), null);
    assert.throws(
      () =>
        editor.read.schema.assertDocument({
          children: [
            { children: [{ text: '' }], tone: 'old', type: 'paragraph' },
          ],
        }),
      /tone/u
    );
    assert.doesNotThrow(() =>
      editor.read.schema.assertDocument({
        children: [
          { children: [{ text: '' }], tone: 'new', type: 'paragraph' },
        ],
      })
    );
  });

  it('rolls back an equal-schema validator rebind that rejects the document', () => {
    const slot = defineExtensionSlot('schema-validation-rebind-rollback');
    const articleSchema = (accepted: string) =>
      defineEditorSchema('schema:schema-validation-rebind-rollback', {
        elements: {
          paragraph: {
            content: schema.content.text(),
            properties: {
              tone: property.json({
                validate: (value): value is string => value === accepted,
                validationVersion: 1,
              }),
            },
          },
        },
        id: 'schema-validation-rebind-rollback',
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      });
    const editor = createEditor({
      extensions: [slot.of(articleSchema('old'))] as const,
      initialValue: [
        {
          ...paragraph('same'),
          tone: 'old',
        },
      ],
    });
    const configurationRevision =
      getCompiledEditorConfiguration(editor).revision;
    const registry = getEditorExtensionRegistry(editor);
    let migrations = 0;

    assert.throws(
      () =>
        editor.update.extensions.reconfigure(slot, articleSchema('new'), {
          migrate({ document }) {
            migrations += 1;
            return {
              ...document,
              children: [
                {
                  ...paragraph('same'),
                  tone: 'new',
                },
              ],
            };
          },
        }),
      /tone/u
    );

    assert.equal(migrations, 0);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      configurationRevision
    );
    assert.equal(getEditorExtensionRegistry(editor), registry);
    assert.deepEqual(editor.read.children(), [
      {
        ...paragraph('same'),
        tone: 'old',
      },
    ]);
  });

  it('requires an explicit migration when candidate root defaults change the document', () => {
    const slot = defineExtensionSlot('explicit-root-default-migration');
    const articleSchema = (version: number, minimum: number) =>
      defineEditorSchema('schema:explicit-root-default-migration', {
        elements: {
          paragraph: {
            content: schema.content.text({ default: 'text', min: 1 }),
          } as const,
        },
        id: 'explicit-root-default-migration',
        root: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: minimum,
        }),
        unknown: 'reject',
        version,
      });
    const bootstrapped = createEditor({
      extensions: [slot.of(articleSchema(2, 1))] as const,
    });
    const editor = createEditor({
      extensions: [slot.of(articleSchema(1, 0))] as const,
    });
    const beforeRevision = getCompiledEditorConfiguration(editor).revision;
    let commits = 0;

    assert.deepEqual(bootstrapped.read.children(), [paragraph('')]);
    editor.subscribeCommit(() => (commits += 1) - 1);

    assert.throws(
      () => editor.update.extensions.reconfigure(slot, articleSchema(2, 1)),
      /requires an explicit migration/u
    );
    assert.deepEqual(editor.read.children(), []);
    assert.equal(namedIdentity(editor.read.schema.identity()).version, 1);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      beforeRevision
    );
    assert.equal(commits, 0);

    editor.update.extensions.reconfigure(slot, articleSchema(2, 1), {
      migrate({ document, next }) {
        return next.fitDocument(document);
      },
    });

    assert.deepEqual(editor.read.children(), [paragraph('')]);
    assert.equal(namedIdentity(editor.read.schema.identity()).version, 2);
    assert.equal(commits, 1);
  });

  it('activates initial extensions before exposing their read group', () => {
    let active = false;
    const extension = defineExtension('initial-activation-state', {
      activate() {
        active = true;
      },
      read: () => {
        if (!active) throw new Error('Initial extension is not active.');

        return { active: () => active };
      },
    });
    const editor = createEditor({ extensions: [extension] as const });

    assert.equal(editor.read['initial-activation-state'].active(), true);
  });

  it('stages reconfiguration until one committed configuration revision', () => {
    const mode = defineFacet<string, string>({
      combine: (values) => values.at(-1) ?? 'missing',
      key: 'configuration-mode',
    });
    const slot = defineExtensionSlot('configuration-mode');
    let activations = 0;
    const extension = (value: string) =>
      defineExtension(`configuration-mode-${value}`, {
        facetProviders: [mode.of(value)],
        activate() {
          activations += 1;
        },
      });
    const editor = createEditor({
      extensions: [slot.of(extension('read'))] as const,
    });
    const before = getCompiledEditorConfiguration(editor);
    const commits: number[] = [];

    editor.subscribeCommit((commit) => commits.push(commit.version));
    editor.update((tx) => {
      tx.extensions.reconfigure(slot, extension('write'));

      assert.equal(editor.read.facet(mode), 'read');
      assert.equal(activations, 1);
    });

    const after = getCompiledEditorConfiguration(editor);

    assert.equal(editor.read.facet(mode), 'write');
    assert.equal(activations, 2);
    assert.deepEqual(commits, [1]);
    assert.equal(after.revision, before.revision + 1);
    assert.equal(Object.isFrozen(after), true);
    assert.equal(Object.isFrozen(after.extensions), true);
  });

  it('does not activate staged configuration when the update aborts', () => {
    const mode = defineFacet<string>({ key: 'aborted-configuration-mode' });
    const slot = defineExtensionSlot('aborted-configuration-mode');
    let activations = 0;
    const extension = (value: string) =>
      defineExtension(`aborted-configuration-mode-${value}`, {
        facetProviders: [mode.of(value)],
        activate() {
          activations += 1;
        },
      });
    const editor = createEditor({
      extensions: [slot.of(extension('read'))] as const,
    });
    const { revision } = getCompiledEditorConfiguration(editor);

    assert.throws(() => {
      editor.update((tx) => {
        tx.extensions.reconfigure(slot, extension('write'));
        throw new Error('abort update');
      });
    }, /abort update/);

    assert.deepEqual(editor.read.facet(mode), ['read']);
    assert.equal(activations, 1);
    assert.equal(getCompiledEditorConfiguration(editor).revision, revision);
  });

  it('rolls back document and configuration when candidate activation fails', () => {
    const mode = defineFacet<string>({ key: 'failed-configuration-mode' });
    const slot = defineExtensionSlot('failed-configuration-mode');
    const lifecycle: string[] = [];
    const errors: Array<{ extensionName: string; phase: string }> = [];
    const persisted = defineStateField({
      initial: 'installed',
      key: 'failed-configuration-field',
      persist: defineValueCodec<string>({
        decode: (value) => String(value),
        encode: (value) => value,
        version: 1,
      }),
    });
    const committedStates: Array<{
      field: string;
      revision: number;
      stateChanged: boolean;
    }> = [];
    const editor = createEditor({
      extensions: [
        slot.of(
          defineExtension('failed-configuration-mode-read', {
            activate(context) {
              lifecycle.push('old:activate');
              context.onCleanup(() => lifecycle.push('old:cleanup'));
            },
            facetProviders: [mode.of('read')],
          })
        ),
      ] as const,
      initialValue: [paragraph('before')],
      lifecycleErrorSink(error) {
        errors.push({ extensionName: error.extensionName, phase: error.phase });
      },
    });
    const { revision } = getCompiledEditorConfiguration(editor);
    const registry = getEditorExtensionRegistry(editor);

    editor.subscribeCommit((commit) => {
      committedStates.push({
        field: editor.read.getField(persisted),
        revision: getCompiledEditorConfiguration(editor).revision,
        stateChanged: commit.changed.has('state'),
      });
    });

    assert.throws(
      () =>
        editor.update((tx) => {
          tx.text.insert('!', { at: { offset: 6, path: [0, 0] } });
          tx.extensions.reconfigure(
            slot,
            defineExtension('failed-configuration-mode-write', {
              activate(context) {
                const runtimeEditor = context.editor;
                lifecycle.push(
                  `new:activate:${runtimeEditor.read
                    .facet(mode)
                    .join(',')}:${runtimeEditor.read.text.string([])}`
                );
                context.signal.addEventListener('abort', () => {
                  lifecycle.push('new:abort');
                });
                context.onCleanup(({ reason }) =>
                  lifecycle.push(`new:cleanup:first:${reason}`)
                );
                context.onCleanup(({ reason }) =>
                  lifecycle.push(`new:cleanup:second:${reason}`)
                );
                throw new Error('activation failed');
              },
              facetProviders: [mode.of('write')],
              stateFields: [persisted],
            })
          );
        }),
      (error) => {
        assert.ok(error instanceof EditorExtensionPublicationError);
        assert.equal(error.extensionName, 'failed-configuration-mode-write');
        assert.equal(error.phase, 'activate');
        assert.match(String(error.cause), /activation failed/);
        assert.deepEqual(error.rollbackErrors, []);

        return true;
      }
    );

    assert.equal(editor.read.text.string([]), 'before');
    assert.throws(() => editor.read.getField(persisted), /not installed/);
    assert.equal(editor.read.value().meta?.[persisted.key], undefined);
    assert.deepEqual(editor.read.facet(mode), ['read']);
    assert.equal(getCompiledEditorConfiguration(editor).revision, revision);
    assert.equal(getEditorExtensionRegistry(editor), registry);
    assert.deepEqual(errors, []);
    assert.deepEqual(committedStates, []);
    assert.deepEqual(lifecycle, [
      'old:activate',
      'new:activate:write:before!',
      'new:abort',
      'new:cleanup:second:rollback',
      'new:cleanup:first:rollback',
    ]);
  });

  it('restores the exact prior publication when commit construction fails', () => {
    const mode = defineFacet<string>({ key: 'post-publication-failure-mode' });
    const slot = defineExtensionSlot('post-publication-failure-mode');
    const lifecycle: string[] = [];
    let previousSignal!: AbortSignal;
    let provisionalSignal!: AbortSignal;
    const editor = createEditor({
      extensions: [
        slot.of(
          defineExtension('post-publication-previous', {
            activate(context) {
              previousSignal = context.signal;
              context.onCleanup(({ reason }) =>
                lifecycle.push(`previous:${reason}`)
              );
            },
            facetProviders: [mode.of('previous')],
          })
        ),
      ] as const,
    });
    const previousRegistry = getEditorExtensionRegistry(editor);
    const previousRevision = getCompiledEditorConfiguration(editor).revision;
    const publication = prepareEditorExtensionPublication(
      editor,
      slot.of(
        defineExtension('post-publication-provisional', {
          activate(context) {
            provisionalSignal = context.signal;
            context.onCleanup(({ reason }) =>
              lifecycle.push(`provisional:${reason}`)
            );
          },
          facetProviders: [mode.of('provisional')],
        })
      )
    );

    assert.throws(() => {
      try {
        publication.stage();
        publication.commit();
        assert.deepEqual(editor.read.facet(mode), ['provisional']);
        throw new Error('forced commit construction failure');
      } catch (error) {
        publication.rollback();
        throw error;
      }
    }, /forced commit construction failure/);

    assert.equal(getEditorExtensionRegistry(editor), previousRegistry);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      previousRevision
    );
    assert.deepEqual(editor.read.facet(mode), ['previous']);
    assert.equal(previousSignal.aborted, false);
    assert.equal(provisionalSignal.aborted, true);
    assert.deepEqual(lifecycle, ['provisional:rollback']);
  });

  it('rolls back earlier candidate activations when a dependency fails', () => {
    const mode = defineFacet<string>({ key: 'partial-activation-mode' });
    const slot = defineExtensionSlot('partial-activation-mode');
    const lifecycle: string[] = [];
    const errors: Array<{ extensionName: string; phase: string }> = [];
    const commits: number[] = [];
    const editor = createEditor({
      extensions: [
        slot.of(
          defineExtension('partial-activation-old', {
            activate(context) {
              context.onCleanup(() => lifecycle.push('old:cleanup'));
            },
            facetProviders: [mode.of('read')],
          })
        ),
      ] as const,
      initialValue: [paragraph('before')],
      lifecycleErrorSink(error) {
        errors.push({ extensionName: error.extensionName, phase: error.phase });
      },
    });
    const registry = getEditorExtensionRegistry(editor);
    const { revision } = getCompiledEditorConfiguration(editor);
    const partialA = defineExtension('partial-activation-a', {
      activate(context) {
        lifecycle.push('a:activate');
        context.signal.addEventListener('abort', () => {
          lifecycle.push('a:abort');
        });
        context.onCleanup(({ reason }) => {
          lifecycle.push(`a:cleanup:${reason}`);
        });
      },
      facetProviders: [mode.of('write')],
    });

    editor.subscribeCommit((commit) => commits.push(commit.version));

    assert.throws(
      () =>
        editor.update((tx) => {
          tx.text.insert('!', { at: { offset: 6, path: [0, 0] } });
          tx.extensions.reconfigure(slot, [
            partialA,
            defineExtension('partial-activation-b', {
              activate() {
                lifecycle.push('b:activate');
                throw new Error('second activation failed');
              },
              dependencies: [partialA],
            }),
          ]);
        }),
      EditorExtensionPublicationError
    );

    assert.equal(editor.read.text.string([]), 'before');
    assert.deepEqual(editor.read.facet(mode), ['read']);
    assert.equal(getEditorExtensionRegistry(editor), registry);
    assert.equal(getCompiledEditorConfiguration(editor).revision, revision);
    assert.deepEqual(commits, []);
    assert.deepEqual(errors, []);
    assert.deepEqual(lifecycle, [
      'a:activate',
      'b:activate',
      'a:abort',
      'a:cleanup:rollback',
    ]);
  });

  it('rejects conflicting descriptors without exposing a partial registry', () => {
    const mode = defineFacet<string>({ key: 'dependency-configuration-mode' });
    const slot = defineExtensionSlot('dependency-configuration-mode');
    const editor = createEditor({
      extensions: [
        slot.of(
          defineExtension('dependency-configuration-mode-read', {
            facetProviders: [mode.of('read')],
          })
        ),
      ] as const,
    });

    const conflictB = defineExtension(
      'dependency-configuration-conflict-b',
      {}
    );
    const conflictA = defineExtension('dependency-configuration-conflict-a', {
      conflicts: [conflictB],
    });

    assert.throws(() => {
      editor.update.extensions.reconfigure(slot, [conflictA, conflictB]);
    }, /conflicts with/);

    assert.deepEqual(editor.read.facet(mode), ['read']);
  });

  it('rejects a detached candidate without changing the live registry', () => {
    const editor = createEditor({
      extensions: [defineExtension('detached-candidate-base', {})] as const,
    });
    const registry = getEditorExtensionRegistry(editor);
    const { revision } = getCompiledEditorConfiguration(editor);
    let apiFactories = 0;
    let activations = 0;

    assert.throws(
      () =>
        prepareEditorExtensionPublication(
          editor,
          defineExtension('invalid-detached-candidate', {
            api() {
              apiFactories += 1;
              return {};
            },
            activate() {
              activations += 1;
            },
            validate() {
              throw new Error('invalid detached candidate');
            },
          })
        ),
      /invalid detached candidate/
    );

    assert.equal(apiFactories, 1);
    assert.equal(activations, 0);
    assert.equal(getEditorExtensionRegistry(editor), registry);
    assert.equal(getCompiledEditorConfiguration(editor).revision, revision);
  });

  it('rejects merged command id collisions without publishing the candidate', () => {
    const editor = createEditor({
      extensions: [
        defineExtension('canonical-command-descriptor', {
          commands: ({ handle }) => [
            handle(editorCommands.insertText, () => false),
          ],
        }),
      ],
    });
    const registry = getEditorExtensionRegistry(editor);
    const { revision } = getCompiledEditorConfiguration(editor);
    const pipeline = registry.commands.byDescriptor.get(
      editorCommands.insertText
    );
    const conflicting = defineCommand(editorCommands.insertText.id);

    assert.throws(
      () =>
        editor.install(
          defineExtension('conflicting-command-descriptor', {
            commands: ({ handle }) => [handle(conflicting, () => false)],
          })
        ),
      /cannot install multiple descriptor identities/
    );

    assert.equal(getEditorExtensionRegistry(editor), registry);
    assert.equal(getCompiledEditorConfiguration(editor).revision, revision);
    assert.equal(
      registry.commands.byDescriptor.get(editorCommands.insertText),
      pipeline
    );
    assert.equal(
      registry.commands.byId.get(editorCommands.insertText.id),
      editorCommands.insertText
    );
    assert.equal(
      registry.commands.byDescriptor.has(editorCommands.insertText),
      true
    );
  });

  it('installs descriptor dependencies before their consumer', () => {
    const command = defineCommand('ordered-command');
    const seen: string[] = [];
    const base = defineExtension('ordered-base', {
      commands: ({ handle }) => [
        handle(command, () => {
          seen.push('base');

          return false;
        }),
      ],
    });
    const dependent = defineExtension('ordered-dependent', {
      commands: ({ handle }) => [
        handle(command, () => {
          seen.push('dependent');

          return false;
        }),
      ],
      dependencies: [base],
    });
    const editor = createEditor({
      extensions: [dependent],
    });
    const registry = getEditorExtensionRegistry(editor);

    assert.equal(dispatchCommand(editor, command), false);
    assert.deepEqual(seen, ['base', 'dependent']);
    assert.deepEqual(
      registry.dependencyOrder.map(({ name }) => name),
      ['ordered-base', 'ordered-dependent']
    );
    assert.equal(registry.extensionsByDescriptor.get(base)?.descriptor, base);
    assert.equal(
      registry.extensionsByDescriptor.get(dependent)?.descriptor,
      dependent
    );
  });

  it('keeps a captured command pipeline immutable through publication', () => {
    const command = defineCommand('captured-command-pipeline');
    const seen: string[] = [];
    const late = defineExtension('captured-command-late', {
      commands: ({ handle }) => [
        handle(command, () => {
          seen.push('late');

          return false;
        }),
      ],
    });
    const editor = createEditor({
      extensions: [
        defineExtension('captured-command-base', {
          commands: ({ handle }) => [
            handle(command, () => {
              seen.push('first');

              return false;
            }),
            handle(command, () => {
              seen.push('second');

              return false;
            }),
          ],
        }),
      ],
    });
    const previousRegistry = getEditorExtensionRegistry(editor);
    const previousPipeline =
      previousRegistry.commands.byDescriptor.get(command)!;
    const previousEntries = previousPipeline.entries;

    assert.equal(dispatchCommand(editor, command), false);
    assert.deepEqual(seen, ['first', 'second']);
    assert.equal(Object.isFrozen(previousPipeline), true);
    assert.equal(Object.isFrozen(previousEntries), true);
    assert.equal(previousPipeline.entries, previousEntries);
    assert.equal(previousEntries.length, 2);

    editor.install(late);

    const currentRegistry = getEditorExtensionRegistry(editor);

    assert.notEqual(currentRegistry, previousRegistry);
    assert.equal(
      currentRegistry.commands.revision,
      previousRegistry.commands.revision + 1
    );
    assert.equal(
      previousRegistry.commands.byDescriptor.get(command),
      previousPipeline
    );

    seen.length = 0;
    assert.equal(dispatchCommand(editor, command), false);
    assert.deepEqual(seen, ['first', 'second', 'late']);
  });

  it('exposes published registry collections as immutable', () => {
    const command = defineCommand('immutable-command');
    const effect = defineEffect({ key: 'immutable-effect' });
    const field = defineStateField({ key: 'immutable-field' });
    const editor = createEditor({
      extensions: [
        defineExtension('immutable-registry', {
          commands: ({ handle }) => [handle(command, () => false)],
          effectTypes: [effect],
          stateFields: [field],
          schema: defineEditorSchema('schema:immutable-registry', {
            elements: {
              'immutable-element': { content: schema.content.open() },
            },
            id: 'immutable-registry',
            properties: [
              schema.textProperty('immutable-property', property.boolean()),
            ],
            root: schema.content.type('immutable-element'),
            unknown: 'reject',
            version: 1,
          }).schema,
          read: () => ({}),
          update: () => ({}),
        }),
      ],
    });
    const registry = getEditorExtensionRegistry(editor);
    const commandPipeline = registry.commands.byDescriptor.get(command)!;
    const registrations = [
      commandPipeline,
      commandPipeline.entries[0],
      registry.effectTypes.get(effect.key),
      registry.schemaContributions.records.get('immutable-registry'),
      registry.schemaContributions.compiled?.elements.byType.get(
        'immutable-element'
      ),
      [
        ...(registry.schemaContributions.compiled?.properties.byId.values() ??
          []),
      ][0],
      registry.schemaContributions.compiled?.primaryRoot,
      registry.stateFields.get(field.key),
      registry.stateGroups.get('immutable-registry'),
      registry.txGroups.get('immutable-registry'),
    ];

    assert.throws(
      () => registry.extensions.delete('immutable-registry'),
      /registries are immutable/
    );
    assert.throws(
      () => registry.schemaContributions.records.delete('immutable-registry'),
      /registries are immutable/
    );
    assert.throws(
      () =>
        (registry.commands.byDescriptor as Map<object, unknown>).delete(
          command
        ),
      /registries are immutable/
    );
    assert.throws(
      () => (registry.commands.byId as Map<string, object>).delete(command.id),
      /registries are immutable/
    );
    assert.throws(() =>
      (commandPipeline.entries as unknown[]).push(commandPipeline.entries[0])
    );
    assert.equal(registry.extensions.has('immutable-registry'), true);
    assert.equal(registry.commands.byId.get(command.id), command);
    assert.equal(registry.commands.revision, registry.configurationRevision);
    assert.equal(
      registrations.every((entry) => Object.isFrozen(entry)),
      true
    );
    assert.throws(() =>
      Object.assign(registry.effectTypes.get(effect.key)!, {
        extensionName: 'mutated',
      })
    );
    assert.equal(
      registry.effectTypes.get(effect.key)?.extensionName,
      'immutable-registry'
    );
  });

  it('canonicalizes declarations and revisions the compiled schema', () => {
    const sourceElement = { inline: false };
    const canonical = defineExtension('canonical-schema-declaration', {
      schema: {
        elements: { 'canonical-schema-element': sourceElement },
        groups: {},
        properties: [],
        roots: {},
      },
    });

    sourceElement.inline = true;
    assert.equal(
      canonical.schema?.elements['canonical-schema-element']?.inline,
      false
    );
    assert.equal(Object.isFrozen(canonical), true);
    assert.equal(Object.isFrozen(canonical.schema), true);
    assert.equal(Object.isFrozen(canonical.schema?.elements), true);
    assert.equal(
      Object.isFrozen(canonical.schema?.elements['canonical-schema-element']),
      true
    );

    const slot = defineExtensionSlot('compiled-schema-revision');
    const extension = (name: string) =>
      defineExtension(name, {
        schema: defineEditorSchema('schema:equivalent-schema', {
          elements: {
            'equivalent-schema-element': { content: schema.content.text() },
          },
          id: 'equivalent-schema',
          root: schema.content.type('equivalent-schema-element'),
          unknown: 'reject',
          version: 1,
        }).schema,
      });
    const editor = createEditor({
      extensions: [slot.of(extension('equivalent-schema-first'))] as const,
    });
    const { schemaRevision } = getEditorExtensionRegistry(editor);

    editor.update.extensions.reconfigure(
      slot,
      extension('equivalent-schema-second')
    );

    assert.equal(
      getEditorExtensionRegistry(editor).schemaRevision,
      schemaRevision
    );
  });

  it('freezes static declarations when defining the extension', () => {
    const sourceElement = {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: false,
    };
    const extension = defineExtension('static-schema-declaration', {
      schema: {
        elements: { paragraph: sourceElement },
        id: 'raw-static-schema-declaration',
        root: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      },
    });
    const editor = createEditor({ extensions: [extension] as const });
    const published = getInstalledEditorExtension(
      editor,
      'static-schema-declaration'
    );

    assert.ok(published);

    sourceElement.inline = true;

    assert.equal(published, extension);
    assert.equal(published?.name, 'static-schema-declaration');
    assert.equal(Object.isFrozen(published), true);
    assert.equal(Object.isFrozen(published?.schema), true);
    assert.equal(
      editor.read.schema.element('paragraph')?.behavior.inline,
      false
    );
  });

  it('keeps the defined extension token as the installed identity', () => {
    const extension = defineExtension('extension-token', {
      api: () => ({ read: () => 'canonical' }),
    });
    const editor = createEditor({ extensions: [extension] as const });

    assert.equal(
      (
        getInstalledEditorExtensionApi(editor, 'extension-token')![
          'extension-token'
        ] as { read: () => string }
      ).read(),
      'canonical'
    );
    assert.equal(
      getInstalledEditorExtension(editor, 'extension-token'),
      extension
    );
  });

  it('clones and deeply freezes schema declarations from another realm', () => {
    const source = runInNewContext(`({
      name: "cross-realm-schema",
      schema: {
        elements: {
          paragraph: {
            content: {
              allowed: {
                kind: "any",
                rules: [
                  { group: "block", kind: "group" },
                  { kind: "not", rule: { kind: "type", type: "image" } }
                ]
              },
              default: { type: "paragraph" },
              min: 1
            },
            groups: ["article"],
            properties: {
              payload: {
                default: { nested: ["foreign"] },
                kind: "json",
                omitDefault: false
              }
            }
          }
        },
        groups: { article: {} },
        id: "cross-realm-schema",
        properties: [{
          inclusive: true,
          key: "tone",
          placement: "text",
          split: "preserve",
          target: { kind: "type", type: "paragraph" },
          typeChange: "drop",
          value: {
            kind: "string",
            omitDefault: false
          }
        }],
        root: {
          allowed: { group: "block", kind: "group" },
          default: { type: "paragraph" },
          min: 1
        },
        roots: {},
        unknown: "reject",
        version: 1
      }
    })`) as EditorExtensionDefinitionInput & Readonly<{ name: string }>;
    const canonical = compileEditorExtension(source);
    const schemaDeclaration = canonical.schema;

    assert.ok(schemaDeclaration && typeof schemaDeclaration !== 'function');

    const paragraphElement = schemaDeclaration.elements?.paragraph;
    const content = paragraphElement?.content;
    const payloadProperty = paragraphElement?.properties?.payload;
    const textProperty = schemaDeclaration.properties?.[0];

    assert.equal(Object.getPrototypeOf(schemaDeclaration), Object.prototype);
    assert.equal(
      Object.getPrototypeOf(schemaDeclaration?.elements),
      Object.prototype
    );
    assert.equal(Object.getPrototypeOf(paragraphElement), Object.prototype);
    assert.equal(Object.getPrototypeOf(content), Object.prototype);
    assert.equal(Object.getPrototypeOf(content?.allowed), Object.prototype);
    assert.equal(
      Object.getPrototypeOf(paragraphElement?.groups),
      Array.prototype
    );
    assert.equal(Object.getPrototypeOf(payloadProperty), Object.prototype);
    assert.equal(
      Object.getPrototypeOf(payloadProperty?.default as object),
      Object.prototype
    );
    assert.equal(
      Object.getPrototypeOf(
        (payloadProperty!.default as { nested: unknown[] }).nested
      ),
      Array.prototype
    );
    assert.equal(
      Object.getPrototypeOf(schemaDeclaration?.root),
      Object.prototype
    );
    assert.equal(
      Object.getPrototypeOf(schemaDeclaration?.properties),
      Array.prototype
    );
    assert.equal(Object.getPrototypeOf(textProperty), Object.prototype);
    assert.equal(Object.getPrototypeOf(textProperty?.target), Object.prototype);

    for (const declaration of [
      canonical,
      schemaDeclaration,
      schemaDeclaration?.elements,
      paragraphElement,
      content,
      content?.allowed,
      paragraphElement?.groups,
      paragraphElement?.properties,
      payloadProperty,
      payloadProperty?.default,
      (payloadProperty!.default as { nested: unknown[] }).nested,
      schemaDeclaration?.root,
      schemaDeclaration?.properties,
      textProperty,
      textProperty?.target,
    ]) {
      assert.equal(Object.isFrozen(declaration), true);
    }

    const sourceSchema = source.schema;

    assert.ok(sourceSchema && typeof sourceSchema !== 'function');

    (
      sourceSchema.elements!.paragraph as {
        content: { min: number };
      }
    ).content.min = 2;
    assert.equal(content?.min, 1);
  });

  it('activates with schema and lifecycle controls', () => {
    const contexts: string[][] = [];
    const mode = defineFacet<string, string>({
      combine: (values) => values.at(-1) ?? 'missing',
      key: 'activation-candidate-mode',
    });
    const editor = createEditor();
    const first = defineExtension('activation-context-first', {
      api: () => ({ probe: 'first' }),
      facetProviders: [mode.of('candidate')],
    });

    editor.install([
      first,
      defineExtension('activation-context-second', {
        activate(context) {
          contexts.push(Object.keys(context).sort());
          assert.equal(typeof context.schema.assertDocument, 'function');
          assert.equal(Object.isFrozen(context), true);
          assert.equal(context.editor.read.facet(mode), 'candidate');
          assert.equal(context.editor.extension(first).api.probe, 'first');
        },
        api: () => ({ probe: 'second' }),
        dependencies: [first],
      }),
    ]);

    assert.deepEqual(contexts, [
      [
        'afterPublish',
        'editor',
        'extensionName',
        'onCleanup',
        'root',
        'schema',
        'signal',
      ],
    ]);
  });

  it('reports ordered rollback failures without hiding activation failure', () => {
    const editor = createEditor();
    const first = defineExtension('rollback-error-first', {
      activate(context) {
        context.onCleanup(() => {
          throw new Error('first cleanup failed');
        });
      },
    });

    assert.throws(
      () =>
        editor.install([
          first,
          defineExtension('rollback-error-second', {
            activate() {
              throw new Error('activation failed');
            },
            dependencies: [first],
          }),
        ]),
      (error) => {
        assert.ok(error instanceof EditorExtensionPublicationError);
        assert.equal(error.extensionName, 'rollback-error-second');
        assert.match(String(error.cause), /activation failed/);
        assert.equal(error.rollbackErrors.length, 1);
        assert.match(String(error.rollbackErrors[0]), /first cleanup failed/);

        return true;
      }
    );
    assert.deepEqual(getCompiledEditorConfiguration(editor).extensions, []);
  });

  it('resolves API factories against a guarded candidate before publication', () => {
    const mode = defineFacet<string>({ key: 'api-factory-mode' });
    const editor = createEditor();
    const registry = getEditorExtensionRegistry(editor);
    let factoryCalls = 0;
    const seed = defineExtension('candidate-api-seed', {
      api: () => ({ candidateSeed: 'visible' }),
    });
    const factory = defineExtension('candidate-api-factory', {
      api(context) {
        factoryCalls += 1;
        assert.deepEqual(Object.keys(context).sort(), [
          'editor',
          'getContributions',
          'root',
        ]);
        assert.equal(Object.isFrozen(context), true);
        const runtimeEditor = context.editor;

        assert.deepEqual(runtimeEditor.read.facet(mode), []);
        assert.equal(
          runtimeEditor.extension(seed).api.candidateSeed,
          'visible'
        );
        assert.equal(
          runtimeEditor.api[seed.name],
          runtimeEditor.extension(seed).api
        );
        assert.throws(
          () => runtimeEditor.update(() => {}),
          /writes cannot be started during extension lifecycle publication/
        );

        return { factoryProbe: 'visible' };
      },
      dependencies: [seed],
      facetProviders: [mode.of('provisional')],
    });
    const publication = prepareEditorExtensionPublication(editor, factory);

    assert.equal(factoryCalls, 1);
    assert.equal(getEditorExtensionRegistry(editor), registry);
    assert.deepEqual(editor.read.facet(mode), []);
    publication.stage();
    publication.commit();
    publication.finalize();
    assert.equal(
      (
        getInstalledEditorExtensionApi(editor, seed.name)![seed.name] as {
          candidateSeed: string;
        }
      ).candidateSeed,
      'visible'
    );
    assert.equal(
      (
        getInstalledEditorExtensionApi(editor, factory.name)![factory.name] as {
          factoryProbe: string;
        }
      ).factoryProbe,
      'visible'
    );
  });

  it('revokes retained candidate portals after failed publication', () => {
    let retainedPortal: Readonly<{ api: unknown }> | undefined;
    const Candidate = defineExtension('revokedCandidatePortal', {
      api: () => ({ ready: () => true }),
      activate(context) {
        const candidateEditor = context.editor as unknown as {
          extension(
            extension: EditorExtensionReference
          ): Readonly<{ api: unknown }>;
        };

        retainedPortal = candidateEditor.extension(Candidate);
        throw new Error('candidate activation failed');
      },
    });
    const editor = createEditor();

    assert.throws(
      () => editor.install(Candidate),
      /candidate activation failed/
    );
    const portal = retainedPortal;

    assert.ok(portal);
    assert.throws(() => portal.api, /descriptor is no longer installed/);
  });

  it('isolates nested editor writes during activation', () => {
    const errors: Array<{ extensionName: string; phase: string }> = [];
    const editor = createEditor({
      lifecycleErrorSink(error) {
        errors.push({ extensionName: error.extensionName, phase: error.phase });
      },
    });
    const registry = getEditorExtensionRegistry(editor);

    assert.throws(
      () =>
        editor.install(
          defineExtension('nested-activation-write', {
            activate({ editor: runtimeEditor }) {
              runtimeEditor.update(() => {});
            },
          })
        ),
      EditorExtensionPublicationError
    );

    assert.equal(getEditorExtensionRegistry(editor), registry);
    assert.deepEqual(errors, []);
    assert.deepEqual(getCompiledEditorConfiguration(editor).extensions, []);
  });

  it('rejects nested editor writes during cleanup', () => {
    const errors: unknown[] = [];
    const editor = createEditor({
      lifecycleErrorSink(error) {
        errors.push(error.cause);
      },
    });
    const cleanup = editor.install(
      defineExtension('nested-cleanup-write', {
        activate(context) {
          const runtimeEditor = context.editor;
          context.onCleanup(() => runtimeEditor.update(() => {}));
        },
      })
    );

    cleanup();

    assert.equal(errors.length, 1);
    assert.match(
      String(errors[0]),
      /editor\.update cannot be nested inside another update|writes cannot be started during extension lifecycle publication/
    );
    assert.deepEqual(getCompiledEditorConfiguration(editor).extensions, []);
  });

  it('never publishes an invalid candidate to APIs or commit observers', () => {
    const editor = createEditor();
    const registry = getEditorExtensionRegistry(editor);
    const { revision } = getCompiledEditorConfiguration(editor);
    const lifecycle: string[] = [];
    let observerCalls = 0;

    editor.subscribeCommit(() => (observerCalls += 1) - 1);
    const invalidApi = defineExtension('invalid-candidate-api', {
      api: () => ({ invalidCandidateApi: 'hidden' }),
    });

    assert.throws(
      () =>
        prepareEditorExtensionPublication(editor, [
          defineExtension('invalid-configuration-phase', {
            activate() {
              lifecycle.push('activate');
            },
            dependencies: [invalidApi],
            validate({ editor: candidateEditor, name }) {
              assert.equal(candidateEditor, editor);
              assert.equal(
                candidateEditor.extension(invalidApi).api.invalidCandidateApi,
                'hidden'
              );
              lifecycle.push(`validate:${name}`);
              throw new Error('configuration validation failed');
            },
          }),
        ]),
      /configuration validation failed/
    );

    assert.deepEqual(lifecycle, ['validate:invalid-configuration-phase']);
    assert.equal(getEditorExtensionRegistry(editor), registry);
    assert.equal(getCompiledEditorConfiguration(editor).revision, revision);
    assert.equal('invalid-candidate-api' in editor.api, false);
    assert.equal(observerCalls, 0);
  });

  it('identifies the configuration owner without permitting validation writes', () => {
    const editor = createEditor();

    assert.throws(
      () =>
        editor.install(
          defineExtension('configuration-owner-write-guard', {
            validate({ editor: owner }) {
              assert.equal(owner, editor);
              owner.update.selection.set(null);
            },
          })
        ),
      /editor\.update cannot be nested inside another update/
    );
  });

  it('publishes one revision before notifying commit observers', () => {
    const mode = defineFacet<string, string>({
      combine: (values) => values.at(-1) ?? 'missing',
      key: 'atomic-observer-mode',
    });
    const slot = defineExtensionSlot('atomic-observer-mode');
    const activationRevisions: number[] = [];
    const observerRevisions: number[] = [];
    const extension = (value: string) =>
      defineExtension(`atomic-observer-mode-${value}`, {
        activate({ editor }) {
          activationRevisions.push(
            getCompiledEditorConfiguration(editor).revision
          );
          assert.equal(editor.read.facet(mode), value);
        },
        facetProviders: [mode.of(value)],
      });
    const editor = createEditor({
      extensions: [slot.of(extension('read'))] as const,
    });
    const before = getCompiledEditorConfiguration(editor).revision;

    activationRevisions.length = 0;
    editor.subscribeCommit(() => {
      observerRevisions.push(getCompiledEditorConfiguration(editor).revision);
    });
    editor.update((tx) => {
      tx.extensions.reconfigure(slot, extension('write'));
      assert.equal(getCompiledEditorConfiguration(editor).revision, before);
    });

    assert.deepEqual(activationRevisions, [before + 1]);
    assert.deepEqual(observerRevisions, [before + 1]);
  });

  it('runs after-publish work after commit observers and allows a new update', () => {
    const events: string[] = [];
    const editor = createEditor({ initialValue: [paragraph('before')] });

    editor.subscribeCommit((commit) => {
      events.push(
        commit.dirtyStateKeys.includes('$configuration')
          ? 'observer:configuration'
          : 'observer:document'
      );
    });
    editor.install(
      defineExtension('after-publish-after-observers', {
        activate(context) {
          events.push('activate');
          context.afterPublish(() => {
            events.push('afterPublish');
            editor.update((tx) => {
              tx.text.insert('!', { at: { offset: 6, path: [0, 0] } });
            });
          });
        },
      })
    );

    assert.deepEqual(events, [
      'activate',
      'observer:configuration',
      'afterPublish',
      'observer:document',
    ]);
    assert.equal(editor.read.text.string([]), 'before!');
  });

  it('reports commit observer failures without losing the install cleanup', () => {
    let afterPublishCalls = 0;
    const errors: Array<{ extensionName: string; phase: string }> = [];
    const editor = createEditor({
      lifecycleErrorSink(error) {
        errors.push({ extensionName: error.extensionName, phase: error.phase });
      },
    });

    const unsubscribe = editor.subscribeCommit(() => {
      throw new Error('observer failed');
    });
    const cleanup = editor.install(
      defineExtension('after-publish-after-observer-failure', {
        activate(context) {
          context.afterPublish(() => {
            afterPublishCalls += 1;
          });
        },
      })
    );

    assert.equal(afterPublishCalls, 1);
    assert.deepEqual(errors, [
      { extensionName: '$editor', phase: 'commit-listener' },
    ]);
    assert.deepEqual(
      getCompiledEditorConfiguration(editor).extensions.map(({ name }) => name),
      ['after-publish-after-observer-failure']
    );
    unsubscribe();
    cleanup();
    assert.deepEqual(getCompiledEditorConfiguration(editor).extensions, []);
  });

  it('does not let a stale cleanup remove a same-name replacement', () => {
    const extension = (value: string) =>
      defineExtension('staleCleanupOwner', {
        read: () => ({ value: () => value }),
      });
    const editor = createEditor();
    const cleanupFirst = editor.install(extension('first'));
    const cleanupSecond = editor.install(extension('second'));

    assert.equal(
      (
        editor.read as typeof editor.read & {
          staleCleanupOwner: { value(): string };
        }
      ).staleCleanupOwner.value(),
      'second'
    );
    cleanupFirst();
    assert.equal(
      (
        editor.read as typeof editor.read & {
          staleCleanupOwner: { value(): string };
        }
      ).staleCleanupOwner.value(),
      'second'
    );
    cleanupSecond();
    assert.throws(
      () =>
        (
          editor.read as typeof editor.read & {
            staleCleanupOwner: { value(): string };
          }
        ).staleCleanupOwner.value(),
      /is not installed/
    );
  });

  it('keeps cached portals bound to their installed descriptor identity', () => {
    const slot = defineExtensionSlot('portal-replacement-owner');
    const extension = (value: string) =>
      defineExtension('portalReplacement', {
        api: () => ({ value: () => value }),
        read: () => ({ value: () => value }),
        update: () => ({ run: () => {} }),
      });
    const first = extension('first');
    const second = extension('second');
    const editor = createEditor({ extensions: [slot.of(first)] });
    const portal = editor.extension(first);
    const capturedUpdate = portal.update;

    assert.equal(portal.api.value(), 'first');
    assert.equal(portal.read.value(), 'first');
    editor.update.extensions.reconfigure(slot, second);

    assert.throws(() => portal.api, /descriptor is no longer installed/);
    assert.throws(
      () => portal.read.value(),
      /descriptor is no longer installed/
    );
    assert.throws(
      () => capturedUpdate.run(),
      /descriptor is no longer installed/
    );
    assert.equal(editor.extension(second).api.value(), 'second');
  });

  it('keeps a slot-owned extension after explicit ownership is cleaned up', () => {
    const extension = defineExtension('slotAndExplicitOwner', {
      read: () => ({ ready: () => true }),
    });
    const slot = defineExtensionSlot('slot-and-explicit-owner');
    const editor = createEditor({ extensions: [slot.of(extension)] });
    const cleanupExplicit = editor.install(extension);

    cleanupExplicit();

    assert.equal(
      (
        editor.read as typeof editor.read & {
          slotAndExplicitOwner: { ready(): boolean };
        }
      ).slotAndExplicitOwner.ready(),
      true
    );
  });

  it('removes a shared slotted extension after its last owner is removed', () => {
    const child = defineExtension('sharedSlottedChild', {
      read: () => ({ ready: () => true }),
    });
    const firstSlot = defineExtensionSlot('first-shared-slot-owner');
    const secondSlot = defineExtensionSlot('second-shared-slot-owner');
    const editor = createEditor();
    const cleanupFirst = editor.install(firstSlot.of(child));
    const cleanupSecond = editor.install(secondSlot.of(child));

    cleanupFirst();
    assert.equal(
      (
        editor.read as typeof editor.read & {
          sharedSlottedChild: { ready(): boolean };
        }
      ).sharedSlottedChild.ready(),
      true
    );
    cleanupSecond();
    assert.throws(
      () =>
        (
          editor.read as typeof editor.read & {
            sharedSlottedChild: { ready(): boolean };
          }
        ).sharedSlottedChild.ready(),
      /is not installed/
    );
  });

  it('activates replacement before deactivating the previous revision', () => {
    const mode = defineFacet<string, string>({
      combine: (values) => values.at(-1) ?? 'missing',
      key: 'activation-order-mode',
    });
    const slot = defineExtensionSlot('activation-order-mode');
    const lifecycle: string[] = [];
    const extension = (value: string) =>
      defineExtension(`activation-order-mode-${value}`, {
        activate(context) {
          const { editor } = context;
          lifecycle.push(`activate:${value}:${editor.read.facet(mode)}`);
          context.onCleanup(() => lifecycle.push(`cleanup:${value}`));
        },
        facetProviders: [mode.of(value)],
      });
    const editor = createEditor({
      extensions: [slot.of(extension('read'))] as const,
    });

    editor.update.extensions.reconfigure(slot, extension('write'));

    assert.deepEqual(lifecycle, [
      'activate:read:read',
      'activate:write:write',
      'cleanup:read',
    ]);
  });

  it('runs abort and cleanup once in deterministic order', () => {
    const lifecycle: string[] = [];
    const editor = createEditor();
    const extension = defineExtension('deterministic-cleanup', {
      activate(context) {
        const mode = 'active';

        context.signal.addEventListener('abort', () => {
          lifecycle.push(`abort:${mode}`);
        });
        context.onCleanup(({ reason }) =>
          lifecycle.push(`cleanup:first:${mode}:${reason}`)
        );
        context.onCleanup(({ reason }) =>
          lifecycle.push(`cleanup:second:${mode}:${reason}`)
        );
      },
    });
    const publication = prepareEditorExtensionPublication(editor, extension);

    publication.stage();
    publication.commit();
    publication.commit();
    publication.finalize();
    publication.cleanup();
    publication.cleanup();

    assert.deepEqual(lifecycle, [
      'abort:active',
      'cleanup:second:active:remove',
      'cleanup:first:active:remove',
    ]);
  });

  it('uses exact replace, remove, and rollback cleanup reasons', () => {
    const lifecycle: string[] = [];
    const editor = createEditor();
    const extension = (revision: string) =>
      defineExtension('cleanup-reason-extension', {
        activate(context) {
          context.onCleanup(({ reason }) =>
            lifecycle.push(`${revision}:${reason}`)
          );
        },
      });

    editor.install(extension('first'));
    const removeSecond = editor.install(extension('second'));
    removeSecond();

    const publication = prepareEditorExtensionPublication(
      editor,
      defineExtension('cleanup-reason-provisional', {
        activate(context) {
          context.onCleanup(({ reason }) =>
            lifecycle.push(`provisional:${reason}`)
          );
        },
      })
    );
    publication.stage();
    publication.commit();
    publication.rollback();

    assert.deepEqual(lifecycle, [
      'first:replace',
      'second:remove',
      'provisional:rollback',
    ]);
  });

  it('reports cleanup failures when a published candidate rolls back', () => {
    const errors: Array<{ extensionName: string; phase: string }> = [];
    const editor = createEditor({
      lifecycleErrorSink(error) {
        errors.push({ extensionName: error.extensionName, phase: error.phase });
      },
    });
    const publication = prepareEditorExtensionPublication(
      editor,
      defineExtension('rollback-cleanup-failure', {
        activate(context) {
          context.onCleanup(() => {
            throw new Error('rollback cleanup failed');
          });
        },
      })
    );

    publication.stage();
    publication.commit();
    publication.rollback();

    assert.deepEqual(errors, [
      { extensionName: 'rollback-cleanup-failure', phase: 'cleanup' },
    ]);
    assert.deepEqual(getCompiledEditorConfiguration(editor).extensions, []);
  });

  it('rejects thenables from every synchronous publication phase', () => {
    const errors: Array<{ extensionName: string; phase: string }> = [];
    const editor = createEditor({
      lifecycleErrorSink(error) {
        errors.push({ extensionName: error.extensionName, phase: error.phase });
      },
    });
    const registry = getEditorExtensionRegistry(editor);

    assert.throws(
      () =>
        editor.install(
          defineExtension('async-api-factory', {
            api: (() => Promise.resolve({})) as never,
          })
        ),
      /API must be synchronous/
    );
    assert.throws(
      () =>
        editor.install(
          defineExtension('async-configuration-validation', {
            validate: (() => Promise.resolve()) as never,
          })
        ),
      /validation must be synchronous/
    );
    assert.equal(getEditorExtensionRegistry(editor), registry);
    assert.deepEqual(getCompiledEditorConfiguration(editor).extensions, []);

    assert.throws(
      () =>
        editor.install(
          defineExtension('async-activation', {
            activate: (() => Promise.resolve()) as never,
          })
        ),
      EditorExtensionPublicationError
    );

    assert.deepEqual(errors, []);
    assert.deepEqual(getCompiledEditorConfiguration(editor).extensions, []);
  });

  it('isolates after-publish and cleanup failures through the lifecycle error sink', () => {
    const errors: Array<{ extensionName: string; phase: string }> = [];
    const editor = createEditor({
      lifecycleErrorSink(error) {
        errors.push({ extensionName: error.extensionName, phase: error.phase });
      },
    });
    const cleanup = editor.install(
      defineExtension('isolated-lifecycle-failures', {
        activate(context) {
          context.afterPublish(() => {
            throw new Error('after-publish failed');
          });
          Reflect.apply(context.onCleanup, context, [() => Promise.resolve()]);
        },
      })
    );

    assert.doesNotThrow(cleanup);
    assert.deepEqual(errors, [
      {
        extensionName: 'isolated-lifecycle-failures',
        phase: 'afterPublish',
      },
      { extensionName: 'isolated-lifecycle-failures', phase: 'cleanup' },
    ]);
    assert.deepEqual(getCompiledEditorConfiguration(editor).extensions, []);
  });

  it('retains a required dependency until its consumer is removed', () => {
    const editor = createEditor();
    const dependency = defineExtension('retryable-cleanup-dependency', {});
    const cleanupDependency = editor.install(dependency);
    const cleanupDependent = editor.install(
      defineExtension('retryable-cleanup-dependent', {
        dependencies: [dependency],
      })
    );

    assert.doesNotThrow(cleanupDependency);
    assert.equal(
      getEditorExtensionRegistry(editor).extensions.has(dependency.name),
      true
    );
    cleanupDependent();
    assert.deepEqual(getCompiledEditorConfiguration(editor).extensions, []);
  });

  it('rejects a dependency descriptor that collides with an explicit installation', () => {
    const editor = createEditor();
    const explicit = defineExtension('dependency-identity-collision', {});
    const conflicting = defineExtension('dependency-identity-collision', {});
    const cleanup = editor.install(explicit);
    const registry = getEditorExtensionRegistry(editor);

    assert.throws(
      () =>
        editor.install(
          defineExtension('dependency-identity-consumer', {
            dependencies: [conflicting],
          })
        ),
      /multiple descriptor identities/
    );
    assert.equal(getEditorExtensionRegistry(editor), registry);
    assert.equal(registry.extensions.get(explicit.name)?.descriptor, explicit);

    cleanup();
    assert.deepEqual(getCompiledEditorConfiguration(editor).extensions, []);
  });

  it('reference-counts one transitive dependency across independent roots', () => {
    const lifecycle: string[] = [];
    const editor = createEditor();
    const dependency = defineExtension('shared-transitive-dependency', {
      activate(context) {
        lifecycle.push('dependency:activate');
        context.onCleanup(() => lifecycle.push('dependency:cleanup'));
      },
    });
    const first = defineExtension('first-transitive-root', {
      activate(context) {
        lifecycle.push('first:activate');
        context.onCleanup(() => lifecycle.push('first:cleanup'));
      },
      dependencies: [dependency],
    });
    const second = defineExtension('second-transitive-root', {
      activate(context) {
        lifecycle.push('second:activate');
        context.onCleanup(() => lifecycle.push('second:cleanup'));
      },
      dependencies: [dependency],
    });
    const cleanupFirst = editor.install(first);
    const cleanupSecond = editor.install(second);

    assert.deepEqual(lifecycle, [
      'dependency:activate',
      'first:activate',
      'second:activate',
    ]);
    cleanupFirst();
    assert.equal(
      getEditorExtensionRegistry(editor).extensions.has(dependency.name),
      true
    );
    assert.deepEqual(lifecycle, [
      'dependency:activate',
      'first:activate',
      'second:activate',
      'first:cleanup',
    ]);
    cleanupSecond();
    assert.deepEqual(lifecycle, [
      'dependency:activate',
      'first:activate',
      'second:activate',
      'first:cleanup',
      'second:cleanup',
      'dependency:cleanup',
    ]);
    assert.deepEqual(getCompiledEditorConfiguration(editor).extensions, []);
  });

  it('keeps every dependency edge topological across root permutations', () => {
    const descriptors: EditorExtensionReference[] = [];

    for (let index = 0; index < 32; index++) {
      descriptors.push(
        defineExtension(`permuted-dag-${index}`, {
          dependencies:
            index === 0
              ? []
              : [
                  descriptors[Math.floor((index - 1) / 2)],
                  ...(index > 3 ? [descriptors[index - 3]] : []),
                ],
        })
      );
    }
    const roots = descriptors.slice(-8);
    const permutations = [
      roots,
      [...roots].reverse(),
      [...roots.slice(3), ...roots.slice(0, 3)],
    ];
    const installedSets = permutations.map((extensions) => {
      const editor = createEditor({ extensions });
      const installed = getCompiledEditorConfiguration(editor).extensions;
      const positions = new Map(
        installed.map((extension, index) => [extension.name, index])
      );

      for (const extension of installed) {
        for (const dependency of extension.dependencies ?? []) {
          assert.ok(
            positions.get(dependency.name)! < positions.get(extension.name)!
          );
        }
      }

      return [...positions.keys()].sort();
    });

    assert.deepEqual(installedSets[1], installedSets[0]);
    assert.deepEqual(installedSets[2], installedSets[0]);
  });

  it('rolls back an activated candidate when its publication becomes stale', () => {
    const editor = createEditor();
    let staleActivations = 0;
    let staleCleanups = 0;
    const first = prepareEditorExtensionPublication(
      editor,
      defineExtension('first-candidate', {})
    );
    const stale = prepareEditorExtensionPublication(
      editor,
      defineExtension('stale-candidate', {
        activate({ onCleanup }) {
          staleActivations += 1;
          onCleanup(() => {
            staleCleanups += 1;
          });
        },
      })
    );

    first.stage();
    stale.stage();
    first.commit();
    first.finalize();

    assert.throws(() => stale.commit(), /publication is stale/);
    assert.equal(staleActivations, 1);
    assert.equal(staleCleanups, 1);
    assert.deepEqual(
      getCompiledEditorConfiguration(editor).extensions.map(({ name }) => name),
      ['first-candidate']
    );
  });
});
