import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runInNewContext } from 'node:vm';

import {
  createEditor,
  createEditorView,
  defineCommand,
  definePlugin,
  defineEditorSchema,
  defineEffect,
  definePluginSlot,
  definePluginPoint,
  defineStateField,
  defineValueCodec,
  ElementApi,
  PluginPublicationError,
  editorCommands,
  property,
  schema,
  type Anchor,
  type Editor,
  type PluginDefinitionInput,
  type PluginReference,
  type EditorSchemaIdentity,
  type Range,
} from 'plitejs';
import { authored } from 'plitejs/authored';
import { history } from 'plitejs/history';

import { hasActiveAnchors } from '../src/core/anchor-state';
import {
  getPluginContributions,
  preparePluginPublication,
} from '../src/core/plugin';
import { applyTransactionSpec } from '../src/core/public-state';
import {
  compilePlugin,
  dispatchCommand,
  getCompiledEditorConfiguration,
  getPluginRegistry,
  getInstalledPluginApi,
  getInstalledPlugin,
  initializePlugins,
} from '../src/internal';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const namedIdentity = (identity: EditorSchemaIdentity) => {
  assert.equal(identity.kind, 'named');

  if (identity.kind !== 'named') assert.fail('Expected named schema identity');

  return identity;
};

describe('transactional plugin configuration', () => {
  it('calls schema factories with only the plugin name', () => {
    let receivedContext: unknown;

    definePlugin('schema-factory-context', {
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
    const imagePlugin = definePlugin('partial-image-schema', {
      schema: { elements: { image: { void: 'block' } } },
    });
    const derivedEditor = createEditor({ plugins: [imagePlugin] });

    assert.equal(derivedEditor.read.schema.identity().kind, 'derived');
    assert.equal(
      derivedEditor.read.schema.element('image')?.behavior.voidKind,
      'block'
    );
    assert.equal(
      getPluginRegistry(derivedEditor).schemaContributions.records.size,
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
      plugins: [documentSchema, imagePlugin],
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
      plugins: [definePlugin('pre-schema-runtime-plugin', {})],
    });
    let commits = 0;

    editor.subscribeCommit(() => (commits += 1) - 1);
    initializePlugins(editor, articleSchema);

    assert.deepEqual(editor.read.children(), [paragraph('')]);
    assert.equal(
      namedIdentity(editor.read.schema.identity()).id,
      'one-shot-schema-bootstrap'
    );
    assert.equal(editor.read.lastCommit(), null);
    assert.equal(commits, 0);
    assert.throws(
      () => initializePlugins(editor, articleSchema),
      /without an installed schema|already initialized/u
    );

    const updated = createEditor();

    updated.update((tx) => tx.nodes.insert(paragraph('written')));
    updated.install(definePlugin('post-document-runtime-plugin', {}));
    assert.throws(
      () => initializePlugins(updated, articleSchema),
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
      initializePlugins(editor, articleSchema);
    }, /guard/u);
    assert.deepEqual(editor.read.value(), { children: [] });
    assert.equal(editor.read.selection(), null);
    assert.equal(editor.read.schema.identity(), derivedIdentity);
    assert.equal(editor.read.lastCommit(), null);

    allowPublishedDocument = true;
    initializePlugins(editor, articleSchema);

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
    const bootstrapOwner = definePlugin('bootstrap-atomic-owner', {});
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
    const previousRegistry = getPluginRegistry(editor);
    const previousVersion = editor.read.runtime.snapshot().version;
    let commits = 0;

    editor.subscribeCommit(() => {
      commits += 1;
      throw new Error('bootstrap must not publish a commit');
    });

    assert.throws(
      () =>
        initializePlugins(editor, [articleSchema, bootstrapOwner], {
          initialize(tx) {
            tx.nodes.replaceChildren([paragraph('after')], { at: [] });
            tx.selection.set(null);
            throw new Error('bootstrap initializer failed after replacement');
          },
        }),
      /bootstrap initializer failed after replacement/u
    );

    assert.equal(getPluginRegistry(editor), previousRegistry);
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
      getInstalledPlugin(editor, 'bootstrap-atomic-owner'),
      undefined
    );

    initializePlugins(editor, [articleSchema, bootstrapOwner], {
      initialize(tx) {
        tx.nodes.replaceChildren([paragraph('after')], { at: [] });
        tx.selection.set(null);
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

    initializePlugins(editor, articleSchema);

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
    const stateOwner = definePlugin('direct-initial-snapshot-state', {
      stateFields: [persisted],
    });
    const editor = createEditor();
    const previousVersion = editor.read.runtime.snapshot().version;
    let commits = 0;

    editor.subscribeCommit(() => (commits += 1) - 1);
    initializePlugins(editor, [articleSchema, stateOwner], {
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
        initializePlugins(editor, articleSchema, {
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
    const previousRegistry = getPluginRegistry(editor);
    const previousVersion = editor.read.runtime.snapshot().version;
    const anchor = editor.anchor([0], { deletion: 'nearest' });

    assert.throws(
      () => initializePlugins(editor, articleSchema),
      /without active anchors/u
    );
    assert.equal(getPluginRegistry(editor), previousRegistry);
    assert.equal(editor.read.schema.identity(), previousIdentity);
    assert.deepEqual(editor.read.children(), [paragraph('before')]);
    assert.equal(editor.read.lastCommit(), null);
    assert.equal(editor.read.runtime.snapshot().version, previousVersion);
    assert.deepEqual(anchor.release(), [0]);

    initializePlugins(editor, articleSchema);

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
    const effectOwner = definePlugin('bootstrap-effect-owner', {
      effectTypes: [effect],
    });
    const editor = createEditor({ initialValue: [paragraph('before')] });
    const previousRegistry = getPluginRegistry(editor);

    assert.throws(
      () =>
        initializePlugins(editor, [articleSchema, effectOwner], {
          initialize(tx) {
            tx.effects.emit(effect, 'unsupported');
          },
        }),
      /cannot publish effects, annotations, or tags/u
    );
    assert.equal(getPluginRegistry(editor), previousRegistry);
    assert.deepEqual(editor.read.children(), [paragraph('before')]);
    assert.equal(editor.read.lastCommit(), null);
    assert.equal(
      getInstalledPlugin(editor, 'bootstrap-effect-owner'),
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
          plugins: [articleSchema],
          initialValue: [
            { children: [{ text: 'must reject' }], type: 'external' },
          ],
        }),
      /external/u
    );

    const explicitEditor = createEditor({
      initialValue: [paragraph('preserve')],
    });

    initializePlugins(explicitEditor, articleSchema);

    assert.deepEqual(explicitEditor.read.children(), [paragraph('preserve')]);
    assert.equal(
      namedIdentity(explicitEditor.read.schema.identity()).id,
      'explicit-schema-bootstrap'
    );
  });

  it('publishes a dynamic plugin migration and schema atomically', () => {
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
    const slot = definePluginSlot('atomic-schema-migration');
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
      plugins: [slot.of(beforeSchema)] as const,
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
      () => editor.update.plugins.reconfigure(slot, afterSchema),
      /unknown editor element type "paragraph"/i
    );
    assert.equal(namedIdentity(editor.read.schema.identity()).version, 1);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      beforeRevision
    );
    assert.deepEqual(editor.read.children(), [paragraph('before')]);
    assert.deepEqual(commits, []);

    editor.update.plugins.reconfigure(slot, afterSchema, {
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
    const slot = definePluginSlot('schema-migration-after-write');
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
      plugins: [slot.of(before)] as const,
      initialValue: [paragraph('before')],
    });

    editor.update((tx) => {
      tx.text.insert('!', { at: { offset: 6, path: [0, 0] } });
      tx.plugins.reconfigure(slot, after, {
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
    const slot = definePluginSlot('failed-schema-migration');
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
      plugins: [
        slot.of(articleSchema(1, 'paragraph')),
        definePlugin('failed-schema-migration-effect', {
          effectTypes: [effect],
        }),
      ] as const,
      initialValue: [paragraph('before')],
    });
    const previousRegistry = getPluginRegistry(editor);
    const previousRevision = getCompiledEditorConfiguration(editor).revision;
    let commits = 0;

    editor.subscribeCommit(() => (commits += 1) - 1);

    assert.throws(
      () =>
        editor.update.plugins.reconfigure(slot, articleSchema(2, 'heading'), {
          migrate() {
            throw new Error('migration failed');
          },
        }),
      /migration failed/
    );
    assert.throws(
      () =>
        editor.update.plugins.reconfigure(slot, articleSchema(2, 'heading'), {
          migrate({ document }) {
            return document;
          },
        }),
      /unknown editor element type "paragraph"/i
    );
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.text.insert('!', { at: { offset: 6, path: [0, 0] } });
          tx.effects.emit(effect, 'must-not-publish');
          tx.plugins.reconfigure(slot, articleSchema(2, 'heading'), {
            migrate() {
              throw new Error('migration failed after prior writes');
            },
          });
        }),
      /migration failed after prior writes/
    );

    assert.equal(getPluginRegistry(editor), previousRegistry);
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
    const slot = definePluginSlot('equivalent-schema-migration');
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
    const schemaPlugin = createSchema();
    const editor = createEditor({
      plugins: [slot.of(schemaPlugin)] as const,
      initialValue: [paragraph('same')],
    });
    const identity = editor.read.schema.identity();
    const configurationRevision =
      getCompiledEditorConfiguration(editor).revision;
    const { schemaRevision } = getPluginRegistry(editor);
    let migrations = 0;
    let commits = 0;

    editor.subscribeCommit(() => (commits += 1) - 1);
    editor.update.plugins.reconfigure(slot, schemaPlugin, {
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
    assert.equal(getPluginRegistry(editor).schemaRevision, schemaRevision);
    assert.equal(editor.read.lastCommit(), null);
  });

  it('publishes a fresh descriptor even when schema grammar is equivalent', () => {
    const slot = definePluginSlot('equivalent-schema-order');
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
      plugins: [slot.of(articleSchema(['article', 'section']))] as const,
      initialValue: [paragraph('same')],
    });
    const identity = editor.read.schema.identity();
    const configurationRevision =
      getCompiledEditorConfiguration(editor).revision;
    const { schemaRevision } = getPluginRegistry(editor);
    let commits = 0;

    editor.subscribeCommit(() => (commits += 1) - 1);
    editor.update.plugins.reconfigure(
      slot,
      articleSchema(['section', 'article'])
    );

    assert.equal(commits, 1);
    assert.equal(editor.read.schema.identity(), identity);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      configurationRevision + 1
    );
    assert.equal(getPluginRegistry(editor).schemaRevision, schemaRevision);
    assert.notEqual(editor.read.lastCommit(), null);
  });

  it('publishes equal-schema non-schema changes without migration', () => {
    const mode = definePluginPoint<string>('equal-schema-non-schema-mode');
    const slot = definePluginSlot('equal-schema-non-schema');
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
    const plugin = (value: string) =>
      definePlugin('equal-schema-non-schema', {
        contributions: [mode.of(value)],
        schema: createSchema(),
      });
    const editor = createEditor({
      plugins: [slot.of(plugin('read'))] as const,
      initialValue: [paragraph('same')],
    });
    const identity = editor.read.schema.identity();
    const configurationRevision =
      getCompiledEditorConfiguration(editor).revision;
    const { schemaRevision } = getPluginRegistry(editor);
    const observations: Array<{
      mode: string;
      revision: number;
      schemaRevision: number;
    }> = [];
    let migrations = 0;

    editor.subscribeCommit(() => {
      observations.push({
        mode: getPluginContributions(editor, mode).at(-1) ?? 'missing',
        revision: getCompiledEditorConfiguration(editor).revision,
        schemaRevision: getPluginRegistry(editor).schemaRevision,
      });
    });
    editor.update.plugins.reconfigure(slot, plugin('write'), {
      migrate({ document }) {
        migrations += 1;
        return document;
      },
    });

    assert.equal(migrations, 0);
    assert.equal(
      getPluginContributions(editor, mode).at(-1) ?? 'missing',
      'write'
    );
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
      initial: PluginReference,
      replacement: PluginReference,
      verify: (editor: Editor<any, any>) => void
    ) => {
      const slot = definePluginSlot(slotName);
      const editor = createEditor({
        plugins: [slot.of(initial)],
        initialValue: [paragraph('same')],
      });
      const identity = editor.read.schema.identity();
      const configurationRevision =
        getCompiledEditorConfiguration(editor).revision;
      const { schemaRevision } = getPluginRegistry(editor);
      let commits = 0;

      editor.subscribeCommit(() => (commits += 1) - 1);
      editor.update.plugins.reconfigure(slot, replacement);

      assert.equal(commits, 1);
      assert.equal(editor.read.schema.identity(), identity);
      assert.equal(
        getCompiledEditorConfiguration(editor).revision,
        configurationRevision + 1
      );
      assert.equal(getPluginRegistry(editor).schemaRevision, schemaRevision);
      verify(editor);
    };
    const setupLifecycle: string[] = [];
    const setupPlugin = (mode: string) =>
      definePlugin('same-schema-setup', {
        activate(context) {
          setupLifecycle.push(`activate:${mode}`);
          context.onCleanup(() => setupLifecycle.push(`cleanup:${mode}`));
        },
        schema: schemaDeclaration,
      });

    assertPublishes(
      'same-schema-setup-slot',
      setupPlugin('read'),
      setupPlugin('write'),
      () =>
        assert.deepEqual(setupLifecycle, [
          'activate:read',
          'activate:write',
          'cleanup:read',
        ])
    );
    assertPublishes(
      'same-schema-api-slot',
      definePlugin('same-schema-api', {
        api: () => ({ value: 'read' }),
        schema: schemaDeclaration,
      }),
      definePlugin('same-schema-api', {
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
    const slot = definePluginSlot('semantic-schema-delta');
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
      plugins: [slot.of(articleSchema(1, false))] as const,
      initialValue: [paragraph('same')],
    });

    editor.update.plugins.reconfigure(slot, articleSchema(2, true), {
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
    const slot = definePluginSlot('schema-validation-rebind');
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
      plugins: [slot.of(articleSchema('old'))] as const,
      initialValue: [paragraph('same')],
    });
    const configurationRevision =
      getCompiledEditorConfiguration(editor).revision;
    const { schemaRevision } = getPluginRegistry(editor);
    let commits = 0;

    editor.subscribeCommit(() => (commits += 1) - 1);
    editor.update.plugins.reconfigure(slot, articleSchema('new'), {
      migrate: ({ document }) => document,
    });

    assert.equal(commits, 1);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      configurationRevision + 1
    );
    assert.equal(getPluginRegistry(editor).schemaRevision, schemaRevision);
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
    const slot = definePluginSlot('schema-validation-rebind-rollback');
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
      plugins: [slot.of(articleSchema('old'))] as const,
      initialValue: [
        {
          ...paragraph('same'),
          tone: 'old',
        },
      ],
    });
    const configurationRevision =
      getCompiledEditorConfiguration(editor).revision;
    const registry = getPluginRegistry(editor);
    let migrations = 0;

    assert.throws(
      () =>
        editor.update.plugins.reconfigure(slot, articleSchema('new'), {
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
    assert.equal(getPluginRegistry(editor), registry);
    assert.deepEqual(editor.read.children(), [
      {
        ...paragraph('same'),
        tone: 'old',
      },
    ]);
  });

  it('requires an explicit migration when candidate root defaults change the document', () => {
    const slot = definePluginSlot('explicit-root-default-migration');
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
      plugins: [slot.of(articleSchema(2, 1))] as const,
    });
    const editor = createEditor({
      plugins: [slot.of(articleSchema(1, 0))] as const,
    });
    const beforeRevision = getCompiledEditorConfiguration(editor).revision;
    let commits = 0;

    assert.deepEqual(bootstrapped.read.children(), [paragraph('')]);
    editor.subscribeCommit(() => (commits += 1) - 1);

    assert.throws(
      () => editor.update.plugins.reconfigure(slot, articleSchema(2, 1)),
      /requires an explicit migration/u
    );
    assert.deepEqual(editor.read.children(), []);
    assert.equal(namedIdentity(editor.read.schema.identity()).version, 1);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      beforeRevision
    );
    assert.equal(commits, 0);

    editor.update.plugins.reconfigure(slot, articleSchema(2, 1), {
      migrate({ document, next }) {
        return next.fitDocument(document);
      },
    });

    assert.deepEqual(editor.read.children(), [paragraph('')]);
    assert.equal(namedIdentity(editor.read.schema.identity()).version, 2);
    assert.equal(commits, 1);
  });

  it('activates initial plugins before exposing their read group', () => {
    let active = false;
    const plugin = definePlugin('initial-activation-state', {
      activate() {
        active = true;
      },
      read: () => {
        if (!active) throw new Error('Initial plugin is not active.');

        return { active: () => active };
      },
    });
    const editor = createEditor({ plugins: [plugin] as const });

    assert.equal(editor.read['initial-activation-state'].active(), true);
  });

  it('stages reconfiguration until one committed configuration revision', () => {
    const mode = definePluginPoint<string>('configuration-mode');
    const slot = definePluginSlot('configuration-mode');
    let activations = 0;
    const plugin = (value: string) =>
      definePlugin(`configuration-mode-${value}`, {
        contributions: [mode.of(value)],
        activate() {
          activations += 1;
        },
      });
    const editor = createEditor({
      plugins: [slot.of(plugin('read'))] as const,
    });
    const before = getCompiledEditorConfiguration(editor);
    const commits: number[] = [];

    editor.subscribeCommit((commit) => commits.push(commit.version));
    editor.update((tx) => {
      tx.plugins.reconfigure(slot, plugin('write'));

      assert.equal(
        getPluginContributions(editor, mode).at(-1) ?? 'missing',
        'read'
      );
      assert.equal(activations, 1);
    });

    const after = getCompiledEditorConfiguration(editor);

    assert.equal(
      getPluginContributions(editor, mode).at(-1) ?? 'missing',
      'write'
    );
    assert.equal(activations, 2);
    assert.deepEqual(commits, [1]);
    assert.equal(after.revision, before.revision + 1);
    assert.equal(Object.isFrozen(after), true);
    assert.equal(Object.isFrozen(after.plugins), true);
  });

  it('does not activate staged configuration when the update aborts', () => {
    const mode = definePluginPoint<string>('aborted-configuration-mode');
    const slot = definePluginSlot('aborted-configuration-mode');
    let activations = 0;
    const plugin = (value: string) =>
      definePlugin(`aborted-configuration-mode-${value}`, {
        contributions: [mode.of(value)],
        activate() {
          activations += 1;
        },
      });
    const editor = createEditor({
      plugins: [slot.of(plugin('read'))] as const,
    });
    const { revision } = getCompiledEditorConfiguration(editor);

    assert.throws(() => {
      editor.update((tx) => {
        tx.plugins.reconfigure(slot, plugin('write'));
        throw new Error('abort update');
      });
    }, /abort update/);

    assert.deepEqual(getPluginContributions(editor, mode), ['read']);
    assert.equal(activations, 1);
    assert.equal(getCompiledEditorConfiguration(editor).revision, revision);
  });

  it('rolls back document and configuration when candidate activation fails', () => {
    const mode = definePluginPoint<string>('failed-configuration-mode');
    const slot = definePluginSlot('failed-configuration-mode');
    const lifecycle: string[] = [];
    const errors: Array<{ pluginName: string; phase: string }> = [];
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
      plugins: [
        slot.of(
          definePlugin('failed-configuration-mode-read', {
            activate(context) {
              lifecycle.push('old:activate');
              context.onCleanup(() => lifecycle.push('old:cleanup'));
            },
            contributions: [mode.of('read')],
          })
        ),
      ] as const,
      initialValue: [paragraph('before')],
      lifecycleErrorSink(error) {
        errors.push({ pluginName: error.pluginName, phase: error.phase });
      },
    });
    const { revision } = getCompiledEditorConfiguration(editor);
    const registry = getPluginRegistry(editor);

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
          tx.plugins.reconfigure(
            slot,
            definePlugin('failed-configuration-mode-write', {
              activate(context) {
                const runtimeEditor = context.editor;
                lifecycle.push(
                  `new:activate:${getPluginContributions(
                    runtimeEditor,
                    mode
                  ).join(',')}:${runtimeEditor.read.text.string([])}`
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
              contributions: [mode.of('write')],
              stateFields: [persisted],
            })
          );
        }),
      (error) => {
        assert.ok(error instanceof PluginPublicationError);
        assert.equal(error.pluginName, 'failed-configuration-mode-write');
        assert.equal(error.phase, 'activate');
        assert.match(String(error.cause), /activation failed/);
        assert.deepEqual(error.rollbackErrors, []);

        return true;
      }
    );

    assert.equal(editor.read.text.string([]), 'before');
    assert.throws(() => editor.read.getField(persisted), /not installed/);
    assert.equal(editor.read.value().meta?.[persisted.key], undefined);
    assert.deepEqual(getPluginContributions(editor, mode), ['read']);
    assert.equal(getCompiledEditorConfiguration(editor).revision, revision);
    assert.equal(getPluginRegistry(editor), registry);
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
    const mode = definePluginPoint<string>('post-publication-failure-mode');
    const slot = definePluginSlot('post-publication-failure-mode');
    const lifecycle: string[] = [];
    let previousSignal!: AbortSignal;
    let provisionalSignal!: AbortSignal;
    const editor = createEditor({
      plugins: [
        slot.of(
          definePlugin('post-publication-previous', {
            activate(context) {
              previousSignal = context.signal;
              context.onCleanup(({ reason }) =>
                lifecycle.push(`previous:${reason}`)
              );
            },
            contributions: [mode.of('previous')],
          })
        ),
      ] as const,
    });
    const previousRegistry = getPluginRegistry(editor);
    const previousRevision = getCompiledEditorConfiguration(editor).revision;
    const publication = preparePluginPublication(
      editor,
      slot.of(
        definePlugin('post-publication-provisional', {
          activate(context) {
            provisionalSignal = context.signal;
            context.onCleanup(({ reason }) =>
              lifecycle.push(`provisional:${reason}`)
            );
          },
          contributions: [mode.of('provisional')],
        })
      )
    );

    assert.throws(() => {
      try {
        publication.stage();
        publication.commit();
        assert.deepEqual(getPluginContributions(editor, mode), ['provisional']);
        throw new Error('forced commit construction failure');
      } catch (error) {
        publication.rollback();
        throw error;
      }
    }, /forced commit construction failure/);

    assert.equal(getPluginRegistry(editor), previousRegistry);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      previousRevision
    );
    assert.deepEqual(getPluginContributions(editor, mode), ['previous']);
    assert.equal(previousSignal.aborted, false);
    assert.equal(provisionalSignal.aborted, true);
    assert.deepEqual(lifecycle, ['provisional:rollback']);
  });

  it('rolls back earlier candidate activations when a dependency fails', () => {
    const mode = definePluginPoint<string>('partial-activation-mode');
    const slot = definePluginSlot('partial-activation-mode');
    const lifecycle: string[] = [];
    const errors: Array<{ pluginName: string; phase: string }> = [];
    const commits: number[] = [];
    const editor = createEditor({
      plugins: [
        slot.of(
          definePlugin('partial-activation-old', {
            activate(context) {
              context.onCleanup(() => lifecycle.push('old:cleanup'));
            },
            contributions: [mode.of('read')],
          })
        ),
      ] as const,
      initialValue: [paragraph('before')],
      lifecycleErrorSink(error) {
        errors.push({ pluginName: error.pluginName, phase: error.phase });
      },
    });
    const registry = getPluginRegistry(editor);
    const { revision } = getCompiledEditorConfiguration(editor);
    const partialA = definePlugin('partial-activation-a', {
      activate(context) {
        lifecycle.push('a:activate');
        context.signal.addEventListener('abort', () => {
          lifecycle.push('a:abort');
        });
        context.onCleanup(({ reason }) => {
          lifecycle.push(`a:cleanup:${reason}`);
        });
      },
      contributions: [mode.of('write')],
    });

    editor.subscribeCommit((commit) => commits.push(commit.version));

    assert.throws(
      () =>
        editor.update((tx) => {
          tx.text.insert('!', { at: { offset: 6, path: [0, 0] } });
          tx.plugins.reconfigure(slot, [
            partialA,
            definePlugin('partial-activation-b', {
              activate() {
                lifecycle.push('b:activate');
                throw new Error('second activation failed');
              },
              dependencies: [partialA],
            }),
          ]);
        }),
      PluginPublicationError
    );

    assert.equal(editor.read.text.string([]), 'before');
    assert.deepEqual(getPluginContributions(editor, mode), ['read']);
    assert.equal(getPluginRegistry(editor), registry);
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
    const mode = definePluginPoint<string>('dependency-configuration-mode');
    const slot = definePluginSlot('dependency-configuration-mode');
    const editor = createEditor({
      plugins: [
        slot.of(
          definePlugin('dependency-configuration-mode-read', {
            contributions: [mode.of('read')],
          })
        ),
      ] as const,
    });

    const conflictB = definePlugin('dependency-configuration-conflict-b', {});
    const conflictA = definePlugin('dependency-configuration-conflict-a', {
      conflicts: [conflictB],
    });

    assert.throws(() => {
      editor.update.plugins.reconfigure(slot, [conflictA, conflictB]);
    }, /conflicts with/);

    assert.deepEqual(getPluginContributions(editor, mode), ['read']);
  });

  it('rejects a detached candidate without changing the live registry', () => {
    const editor = createEditor({
      plugins: [definePlugin('detached-candidate-base', {})] as const,
    });
    const registry = getPluginRegistry(editor);
    const { revision } = getCompiledEditorConfiguration(editor);
    let apiFactories = 0;
    let activations = 0;

    assert.throws(
      () =>
        preparePluginPublication(
          editor,
          definePlugin('invalid-detached-candidate', {
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
    assert.equal(getPluginRegistry(editor), registry);
    assert.equal(getCompiledEditorConfiguration(editor).revision, revision);
  });

  it('rejects merged command id collisions without publishing the candidate', () => {
    const editor = createEditor({
      plugins: [
        definePlugin('canonical-command-descriptor', {
          commands: ({ handle }) => [
            handle(editorCommands.insertText, () => false),
          ],
        }),
      ],
    });
    const registry = getPluginRegistry(editor);
    const { revision } = getCompiledEditorConfiguration(editor);
    const pipeline = registry.commands.byDescriptor.get(
      editorCommands.insertText
    );
    const conflicting = defineCommand(editorCommands.insertText.id);

    assert.throws(
      () =>
        editor.install(
          definePlugin('conflicting-command-descriptor', {
            commands: ({ handle }) => [handle(conflicting, () => false)],
          })
        ),
      /cannot install multiple descriptor identities/
    );

    assert.equal(getPluginRegistry(editor), registry);
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
    const base = definePlugin('ordered-base', {
      commands: ({ handle }) => [
        handle(command, () => {
          seen.push('base');

          return false;
        }),
      ],
    });
    const dependent = definePlugin('ordered-dependent', {
      commands: ({ handle }) => [
        handle(command, () => {
          seen.push('dependent');

          return false;
        }),
      ],
      dependencies: [base],
    });
    const editor = createEditor({
      plugins: [dependent],
    });
    const registry = getPluginRegistry(editor);

    assert.equal(dispatchCommand(editor, command), false);
    assert.deepEqual(seen, ['base', 'dependent']);
    assert.deepEqual(
      registry.dependencyOrder.map(({ name }) => name),
      ['ordered-base', 'ordered-dependent']
    );
    assert.equal(registry.pluginsByDescriptor.get(base)?.descriptor, base);
    assert.equal(
      registry.pluginsByDescriptor.get(dependent)?.descriptor,
      dependent
    );
  });

  it('keeps a captured command pipeline immutable through publication', () => {
    const command = defineCommand('captured-command-pipeline');
    const seen: string[] = [];
    const late = definePlugin('captured-command-late', {
      commands: ({ handle }) => [
        handle(command, () => {
          seen.push('late');

          return false;
        }),
      ],
    });
    const editor = createEditor({
      plugins: [
        definePlugin('captured-command-base', {
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
    const previousRegistry = getPluginRegistry(editor);
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

    const currentRegistry = getPluginRegistry(editor);

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
      plugins: [
        definePlugin('immutable-registry', {
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
    const registry = getPluginRegistry(editor);
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
      () => registry.plugins.delete('immutable-registry'),
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
    assert.equal(registry.plugins.has('immutable-registry'), true);
    assert.equal(registry.commands.byId.get(command.id), command);
    assert.equal(registry.commands.revision, registry.configurationRevision);
    assert.equal(
      registrations.every((entry) => Object.isFrozen(entry)),
      true
    );
    assert.throws(() =>
      Object.assign(registry.effectTypes.get(effect.key), {
        pluginName: 'mutated',
      })
    );
    assert.equal(
      registry.effectTypes.get(effect.key)?.pluginName,
      'immutable-registry'
    );
  });

  it('canonicalizes declarations and revisions the compiled schema', () => {
    const sourceElement = { inline: false };
    const canonical = definePlugin('canonical-schema-declaration', {
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

    const slot = definePluginSlot('compiled-schema-revision');
    const plugin = (name: string) =>
      definePlugin(name, {
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
      plugins: [slot.of(plugin('equivalent-schema-first'))] as const,
    });
    const { schemaRevision } = getPluginRegistry(editor);

    editor.update.plugins.reconfigure(slot, plugin('equivalent-schema-second'));

    assert.equal(getPluginRegistry(editor).schemaRevision, schemaRevision);
  });

  it('freezes static declarations when defining the plugin', () => {
    const sourceElement = {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: false,
    };
    const plugin = definePlugin('static-schema-declaration', {
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
    const editor = createEditor({ plugins: [plugin] as const });
    const published = getInstalledPlugin(editor, 'static-schema-declaration');

    assert.ok(published);

    sourceElement.inline = true;

    assert.equal(published, plugin);
    assert.equal(published?.name, 'static-schema-declaration');
    assert.equal(Object.isFrozen(published), true);
    assert.equal(Object.isFrozen(published?.schema), true);
    assert.equal(
      editor.read.schema.element('paragraph')?.behavior.inline,
      false
    );
  });

  it('keeps the defined plugin token as the installed identity', () => {
    const plugin = definePlugin('plugin-token', {
      api: () => ({ read: () => 'canonical' }),
    });
    const editor = createEditor({ plugins: [plugin] as const });

    assert.equal(
      (
        getInstalledPluginApi(editor, 'plugin-token')!['plugin-token'] as {
          read: () => string;
        }
      ).read(),
      'canonical'
    );
    assert.equal(getInstalledPlugin(editor, 'plugin-token'), plugin);
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
    })`) as PluginDefinitionInput & Readonly<{ name: string }>;
    const canonical = compilePlugin(source);
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
    const mode = definePluginPoint<string>('activation-candidate-mode');
    const editor = createEditor();
    const first = definePlugin('activation-context-first', {
      api: () => ({ probe: 'first' }),
      contributions: [mode.of('candidate')],
    });

    editor.install([
      first,
      definePlugin('activation-context-second', {
        activate(context) {
          contexts.push(Object.keys(context).sort());
          assert.equal(typeof context.schema.assertDocument, 'function');
          assert.equal(Object.isFrozen(context), true);
          assert.equal(
            getPluginContributions(context.editor, mode).at(-1) ?? 'missing',
            'candidate'
          );
          assert.equal(context.editor.plugin(first).api.probe, 'first');
        },
        api: () => ({ probe: 'second' }),
        dependencies: [first],
      }),
    ]);

    assert.deepEqual(contexts, [
      [
        'afterPublish',
        'beforePublish',
        'editor',
        'onCleanup',
        'pluginName',
        'root',
        'schema',
        'signal',
      ],
    ]);
  });

  it('reports ordered rollback failures without hiding activation failure', () => {
    const editor = createEditor();
    const first = definePlugin('rollback-error-first', {
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
          definePlugin('rollback-error-second', {
            activate() {
              throw new Error('activation failed');
            },
            dependencies: [first],
          }),
        ]),
      (error) => {
        assert.ok(error instanceof PluginPublicationError);
        assert.equal(error.pluginName, 'rollback-error-second');
        assert.match(String(error.cause), /activation failed/);
        assert.equal(error.rollbackErrors.length, 1);
        assert.match(String(error.rollbackErrors[0]), /first cleanup failed/);

        return true;
      }
    );
    assert.deepEqual(getCompiledEditorConfiguration(editor).plugins, []);
  });

  it('resolves API factories against a guarded candidate before publication', () => {
    const mode = definePluginPoint<string>('api-factory-mode');
    const editor = createEditor();
    const registry = getPluginRegistry(editor);
    let factoryCalls = 0;
    const seed = definePlugin('candidate-api-seed', {
      api: () => ({ candidateSeed: 'visible' }),
    });
    const factory = definePlugin('candidate-api-factory', {
      api(context) {
        factoryCalls += 1;
        assert.deepEqual(Object.keys(context).sort(), [
          'editor',
          'getContributions',
          'root',
        ]);
        assert.equal(Object.isFrozen(context), true);
        const runtimeEditor = context.editor;

        assert.deepEqual(getPluginContributions(runtimeEditor, mode), []);
        assert.equal(runtimeEditor.plugin(seed).api.candidateSeed, 'visible');
        assert.equal(
          runtimeEditor.api[seed.name],
          runtimeEditor.plugin(seed).api
        );
        assert.throws(
          () => runtimeEditor.update(() => {}),
          /writes cannot be started during plugin lifecycle publication/
        );

        return { factoryProbe: 'visible' };
      },
      dependencies: [seed],
      contributions: [mode.of('provisional')],
    });
    const publication = preparePluginPublication(editor, factory);

    assert.equal(factoryCalls, 1);
    assert.equal(getPluginRegistry(editor), registry);
    assert.deepEqual(getPluginContributions(editor, mode), []);
    publication.stage();
    publication.commit();
    publication.finalize();
    assert.equal(
      (
        getInstalledPluginApi(editor, seed.name)![seed.name] as {
          candidateSeed: string;
        }
      ).candidateSeed,
      'visible'
    );
    assert.equal(
      (
        getInstalledPluginApi(editor, factory.name)![factory.name] as {
          factoryProbe: string;
        }
      ).factoryProbe,
      'visible'
    );
  });

  it('revokes retained candidate portals after failed publication', () => {
    let retainedPortal: Readonly<{ api: unknown }> | undefined;
    const Candidate = definePlugin('revokedCandidatePortal', {
      api: () => ({ ready: () => true }),
      activate(context) {
        const candidateEditor = context.editor as unknown as {
          plugin(plugin: PluginReference): Readonly<{ api: unknown }>;
        };

        retainedPortal = candidateEditor.plugin(Candidate);
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
    const errors: Array<{ pluginName: string; phase: string }> = [];
    const editor = createEditor({
      lifecycleErrorSink(error) {
        errors.push({ pluginName: error.pluginName, phase: error.phase });
      },
    });
    const registry = getPluginRegistry(editor);

    assert.throws(
      () =>
        editor.install(
          definePlugin('nested-activation-write', {
            activate({ editor: runtimeEditor }) {
              runtimeEditor.update(() => {});
            },
          })
        ),
      PluginPublicationError
    );

    assert.equal(getPluginRegistry(editor), registry);
    assert.deepEqual(errors, []);
    assert.deepEqual(getCompiledEditorConfiguration(editor).plugins, []);
  });

  it('rejects nested editor writes during cleanup', () => {
    const errors: unknown[] = [];
    const editor = createEditor({
      lifecycleErrorSink(error) {
        errors.push(error.cause);
      },
    });
    const cleanup = editor.install(
      definePlugin('nested-cleanup-write', {
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
      /editor\.update cannot be nested inside another update|writes cannot be started during plugin lifecycle publication/
    );
    assert.deepEqual(getCompiledEditorConfiguration(editor).plugins, []);
  });

  it('never publishes an invalid candidate to APIs or commit observers', () => {
    const editor = createEditor();
    const registry = getPluginRegistry(editor);
    const { revision } = getCompiledEditorConfiguration(editor);
    const lifecycle: string[] = [];
    let observerCalls = 0;

    editor.subscribeCommit(() => (observerCalls += 1) - 1);
    const invalidApi = definePlugin('invalid-candidate-api', {
      api: () => ({ invalidCandidateApi: 'hidden' }),
    });

    assert.throws(
      () =>
        preparePluginPublication(editor, [
          definePlugin('invalid-configuration-phase', {
            activate() {
              lifecycle.push('activate');
            },
            dependencies: [invalidApi],
            validate({ editor: candidateEditor, name }) {
              assert.equal(candidateEditor, editor);
              assert.equal(
                candidateEditor.plugin(invalidApi).api.invalidCandidateApi,
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
    assert.equal(getPluginRegistry(editor), registry);
    assert.equal(getCompiledEditorConfiguration(editor).revision, revision);
    assert.equal('invalid-candidate-api' in editor.api, false);
    assert.equal(observerCalls, 0);
  });

  it('identifies the configuration owner without permitting validation writes', () => {
    const editor = createEditor();

    assert.throws(
      () =>
        editor.install(
          definePlugin('configuration-owner-write-guard', {
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
    const mode = definePluginPoint<string>('atomic-observer-mode');
    const slot = definePluginSlot('atomic-observer-mode');
    const activationRevisions: number[] = [];
    const observerRevisions: number[] = [];
    const plugin = (value: string) =>
      definePlugin(`atomic-observer-mode-${value}`, {
        activate({ editor }) {
          activationRevisions.push(
            getCompiledEditorConfiguration(editor).revision
          );
          assert.equal(
            getPluginContributions(editor, mode).at(-1) ?? 'missing',
            value
          );
        },
        contributions: [mode.of(value)],
      });
    const editor = createEditor({
      plugins: [slot.of(plugin('read'))] as const,
    });
    const before = getCompiledEditorConfiguration(editor).revision;

    activationRevisions.length = 0;
    editor.subscribeCommit(() => {
      observerRevisions.push(getCompiledEditorConfiguration(editor).revision);
    });
    editor.update((tx) => {
      tx.plugins.reconfigure(slot, plugin('write'));
      assert.equal(getCompiledEditorConfiguration(editor).revision, before);
    });

    assert.deepEqual(activationRevisions, [before + 1]);
    assert.deepEqual(observerRevisions, [before + 1]);
  });

  it('initializes saved authored ranges against the final initial snapshot', () => {
    const source = createEditor({
      initialValue: [paragraph('persisted')],
      plugins: [authored({ authorId: 'alice' })],
    });
    const range = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 8 },
    };
    const original = source.anchor(range, { deletion: 'drop' });
    const saved = JSON.parse(JSON.stringify(source.anchor.save(original)));
    const snapshot = JSON.parse(JSON.stringify(source.read.value()));
    original.release();
    const editor = createEditor({ initialValue: [paragraph('')] });
    const events: string[] = [];
    let restored: Anchor<Range> | undefined;
    initializePlugins(
      editor,
      [
        authored({ authorId: 'alice' }),
        definePlugin('final-snapshot-range', {
          activate({ beforePublish, afterPublish, onCleanup }) {
            onCleanup(() => {
              restored?.release();
            });
            beforePublish(() => {
              assert.equal(editor.read.text.string([]), 'persisted');
              restored = editor.anchor.restore(saved);
              assert.deepEqual(restored.resolve(), range);
              events.push('ready');
            });
            afterPublish(() => {
              events.push('published');
            });
          },
        }),
      ],
      { initialValue: () => snapshot }
    );
    assert.deepEqual(events, ['ready', 'published']);
    assert.deepEqual(restored?.resolve(), range);
    restored?.release();
    assert.equal(hasActiveAnchors(editor), false);
  });

  it('throws before construction returns and rolls back acquired resources', () => {
    const events: string[] = [];
    let candidate: Editor | undefined;
    let acquired: Anchor<Range> | undefined;
    const source = createEditor({ initialValue: [paragraph('long')] });
    const original = source.anchor(
      {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 4 },
      },
      { deletion: 'drop' }
    );
    const saved = source.anchor.save(original);
    original.release();
    assert.throws(
      () =>
        createEditor({
          initialValue: [paragraph('x')],
          lifecycleErrorSink() {
            events.push('sink');
          },
          plugins: [
            definePlugin('invalid-final-range', {
              activate({
                editor,
                beforePublish,
                afterPublish,
                onCleanup,
                signal,
              }) {
                candidate = editor;
                signal.addEventListener('abort', () => {
                  events.push('abort');
                });
                onCleanup(({ reason }) => {
                  acquired?.release();
                  events.push(reason);
                });
                beforePublish(() => {
                  acquired = editor.anchor(
                    {
                      anchor: { path: [0, 0], offset: 0 },
                      focus: { path: [0, 0], offset: 1 },
                    },
                    { deletion: 'drop' }
                  );
                  editor.anchor.restore(saved);
                });
                afterPublish(() => {
                  events.push('published');
                });
              },
            }),
          ],
        }),
      (error: unknown) => {
        assert.ok(error instanceof PluginPublicationError);
        assert.equal(error.phase, 'beforePublish');
        assert.match(error.message, /offset/i);
        return true;
      }
    );
    assert.deepEqual(events, ['abort', 'rollback']);
    assert.ok(candidate);
    assert.equal(hasActiveAnchors(candidate), false);
    assert.equal(acquired?.resolve(), null);
  });

  for (const useAuthored of [false, true]) {
    it(`binds a saved ${useAuthored ? 'authored' : 'ordinary'} range to the final dynamic draft before observers`, () => {
      const slot = definePluginSlot('dynamic-final-range');
      const editor = createEditor({
        initialValue: [paragraph('text')],
        plugins: [
          history(),
          ...(useAuthored ? [authored({ authorId: 'alice' })] : []),
          slot.of([]),
        ],
      });
      const range = {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 3 },
      };
      const original = editor.anchor(range, { deletion: 'drop' });
      const saved = editor.anchor.save(original);
      const expected = useAuthored
        ? {
            anchor: { path: [0, 0], offset: 2 },
            focus: { path: [0, 0], offset: 4 },
          }
        : range;
      const events: string[] = [];
      let restored: Anchor<Range> | undefined;
      let created: Anchor<Range> | undefined;
      let path: Anchor<number[]> | undefined;
      const plugin = definePlugin('dynamic-final-range-owner', {
        activate({ beforePublish, afterPublish, onCleanup }) {
          onCleanup(() => {
            restored?.release();
            created?.release();
            path?.release();
          });
          beforePublish(() => {
            assert.equal(editor.read.text.string([]), '!text');
            restored = editor.anchor.restore(saved);
            created = editor.anchor(expected, { deletion: 'drop' });
            path = editor.anchor([0], { deletion: 'drop' });
            assert.deepEqual(restored.resolve(), expected);
            assert.deepEqual(created.resolve(), expected);
            events.push('ready');
          });
          afterPublish(() => {
            events.push('published');
          });
        },
      });
      const unsubscribe = editor.subscribeCommit(() => {
        assert.deepEqual(restored?.resolve(), expected);
        events.push('observer');
      });
      editor.update((tx) => {
        tx.plugins.reconfigure(slot, plugin);
        tx.text.insert('!', { at: { path: [0, 0], offset: 0 } });
      });
      assert.deepEqual(events, ['ready', 'observer', 'published']);
      assert.deepEqual(restored?.resolve(), expected);
      assert.deepEqual(created?.resolve(), expected);
      unsubscribe();
      editor.update((tx) => {
        tx.history.newBatch();
        tx.text.insert('?', { at: { path: [0, 0], offset: 0 } });
      });
      assert.deepEqual(restored?.resolve(), {
        anchor: { ...expected.anchor, offset: expected.anchor.offset + 1 },
        focus: { ...expected.focus, offset: expected.focus.offset + 1 },
      });
      assert.deepEqual(created?.resolve(), restored?.resolve());
      editor.api.history.undo();
      assert.deepEqual(restored?.resolve(), expected);
      assert.deepEqual(created?.resolve(), expected);
      editor.update((tx) => {
        tx.history.newBatch();
        tx.nodes.insert(paragraph('before'), { at: [0] });
      });
      assert.deepEqual(path?.resolve(), [1]);
      assert.deepEqual(created?.resolve(), {
        anchor: { ...expected.anchor, path: [1, 0] },
        focus: { ...expected.focus, path: [1, 0] },
      });
      editor.api.history.undo();
      assert.deepEqual(path?.resolve(), [0]);
      assert.deepEqual(created?.resolve(), expected);
      restored?.release();
      created?.release();
      path?.release();
      original.release();
      assert.equal(hasActiveAnchors(editor), false);
    });

    it(`restores a saved ${useAuthored ? 'authored' : 'ordinary'} range while replacing the document and installing its owner`, () => {
      const plugins = useAuthored ? [authored({ authorId: 'alice' })] : [];
      const source = createEditor({
        initialValue: [paragraph('replacement')],
        plugins,
      });
      const expected = {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 10 },
      };
      const original = source.anchor(expected, { deletion: 'drop' });
      const saved = source.anchor.save(original);
      original.release();
      const slot = definePluginSlot('replacement-final-range');
      const editor = createEditor({
        initialValue: [paragraph('old')],
        plugins: [history(), ...plugins, slot.of([])],
      });
      let restored: Anchor<Range> | undefined;
      editor.update((tx) => {
        tx.value.replace(source.read.value());
        tx.plugins.reconfigure(
          slot,
          definePlugin('replacement-range-owner', {
            activate({ beforePublish, onCleanup }) {
              onCleanup(() => {
                restored?.release();
              });
              beforePublish(() => {
                restored = editor.anchor.restore(saved);
                assert.deepEqual(restored.resolve(), expected);
              });
            },
          })
        );
      });
      assert.deepEqual(restored?.resolve(), expected);
      editor.update((tx) => {
        tx.history.newBatch();
        tx.text.insert('?', { at: { path: [0, 0], offset: 0 } });
      });
      assert.deepEqual(restored?.resolve(), {
        anchor: { ...expected.anchor, offset: expected.anchor.offset + 1 },
        focus: { ...expected.focus, offset: expected.focus.offset + 1 },
      });
      editor.api.history.undo();
      assert.deepEqual(restored?.resolve(), expected);
      restored?.release();
      assert.equal(hasActiveAnchors(editor), false);
    });

    it(`discards prepared ${useAuthored ? 'authored' : 'ordinary'} replacement ranges when a later initializer fails`, () => {
      const plugins = useAuthored ? [authored({ authorId: 'alice' })] : [];
      const source = createEditor({
        initialValue: [paragraph('replacement')],
        plugins,
      });
      const savedAnchor = source.anchor(
        {
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 10 },
        },
        { deletion: 'nearest' }
      );
      const saved = source.anchor.save(savedAnchor);
      savedAnchor.release();
      const slot = definePluginSlot('failed-replacement-range');
      const editor = createEditor({
        initialValue: [paragraph('old')],
        plugins: [...plugins, slot.of([])],
      });
      const originalRange = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 2 },
      };
      const original = editor.anchor(originalRange, { deletion: 'nearest' });
      const value = editor.read.value();
      const registry = getPluginRegistry(editor);
      let restored: Anchor<Range> | undefined;
      const events: string[] = [];
      editor.subscribeCommit(() => {
        events.push('observer');
      });
      assert.throws(
        () =>
          editor.update((tx) => {
            tx.value.replace(source.read.value());
            tx.plugins.reconfigure(
              slot,
              definePlugin('failed-replacement-range-owner', {
                activate({ beforePublish, afterPublish, onCleanup }) {
                  onCleanup(({ reason }) => {
                    restored?.release();
                    events.push(reason);
                  });
                  beforePublish(() => {
                    restored = editor.anchor.restore(saved);
                    assert.equal(restored.resolve()?.focus.offset, 10);
                    events.push('ready');
                  });
                  beforePublish(() => {
                    throw new Error('later initializer rejected replacement');
                  });
                  afterPublish(() => {
                    events.push('published');
                  });
                },
              })
            );
          }),
        /later initializer rejected replacement/
      );
      assert.deepEqual(events, ['ready', 'rollback']);
      assert.deepEqual(editor.read.value(), value);
      assert.equal(getPluginRegistry(editor), registry);
      assert.deepEqual(original.resolve(), originalRange);
      assert.equal(restored?.resolve(), null);
      editor.update.text.insert('!', { at: { path: [0, 0], offset: 0 } });
      assert.deepEqual(original.resolve(), {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 3 },
      });
      original.release();
      assert.equal(hasActiveAnchors(editor), false);
    });
  }

  it('binds final proposed coordinates without publishing proposal text into the accepted document', () => {
    const slot = definePluginSlot('proposed-final-range');
    const editor = createEditor({
      initialValue: [paragraph('text')],
      plugins: [authored({ authorId: 'alice' }), history(), slot.of([])],
    });
    const proposed = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'proposed' },
    });
    const expected = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    let range: Anchor<Range> | undefined;
    proposed.update((tx) => {
      tx.text.insert('!?', { at: { path: [0, 0], offset: 0 } });
      tx.plugins.reconfigure(
        slot,
        definePlugin('proposed-final-range-owner', {
          activate({ beforePublish, onCleanup }) {
            onCleanup(() => {
              range?.release();
            });
            beforePublish(() => {
              assert.equal(editor.read.text.string([]), 'text');
              assert.equal(proposed.read.text.string([]), '!?text');
              range = proposed.anchor(expected, { deletion: 'drop' });
            });
          },
        })
      );
    });
    assert.deepEqual(range?.resolve(), expected);
    assert.equal(editor.read.text.string([]), 'text');
    proposed.update((tx) => {
      tx.history.newBatch();
      tx.text.insert('X', { at: { path: [0, 0], offset: 0 } });
    });
    assert.deepEqual(range?.resolve(), {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    });
    editor.api.history.undo();
    assert.deepEqual(range?.resolve(), expected);
    range?.release();
    assert.equal(hasActiveAnchors(editor), false);
  });

  it('retains deletion recovery for an ordinary restored range alongside live anchors', () => {
    const editor = createEditor({
      initialValue: [paragraph('text')],
      plugins: [history()],
    });
    const range = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    };
    const original = editor.anchor(range, { deletion: 'nearest' });
    const saved = editor.anchor.save(original);
    let restored: Anchor<Range> | undefined;
    const cleanup = editor.install(
      definePlugin('deletion-recovery-range', {
        activate({ beforePublish, onCleanup }) {
          onCleanup(() => {
            restored?.release();
          });
          beforePublish(() => {
            restored = editor.anchor.restore(saved);
          });
        },
      })
    );
    assert.deepEqual(restored?.resolve(), original.resolve());
    editor.update((tx) => {
      tx.history.newBatch();
      tx.text.delete({ at: range });
    });
    assert.deepEqual(restored?.resolve(), original.resolve());
    editor.api.history.undo();
    assert.deepEqual(original.resolve(), range);
    assert.deepEqual(restored?.resolve(), range);
    cleanup();
    original.release();
    assert.equal(hasActiveAnchors(editor), false);
  });

  it('rolls back final-draft resources and preserves the previous plugin and authored document', () => {
    const events: string[] = [];
    const slot = definePluginSlot('rollback-final-range');
    const previous = definePlugin('previous-final-range', {
      api: () => ({ ready: true }),
      activate({ onCleanup }) {
        onCleanup(() => {
          events.push('previous:cleanup');
        });
      },
    });
    const editor = createEditor({
      initialValue: [paragraph('text')],
      plugins: [authored({ authorId: 'alice' }), slot.of(previous)],
      lifecycleErrorSink() {
        events.push('sink');
      },
    });
    const range = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    };
    const original = editor.anchor(range, { deletion: 'drop' });
    const saved = editor.anchor.save(original);
    const snapshot = editor.read.value();
    const { version } = editor.read.runtime.snapshot();
    const registry = getPluginRegistry(editor);
    let restored: Anchor<Range> | undefined;
    let writeDraft = () => {};
    const resource = definePlugin('rollback-final-resource', {
      activate({ beforePublish, afterPublish, onCleanup }) {
        onCleanup(({ reason }) => {
          restored?.release();
          events.push(`resource:${reason}`);
        });
        beforePublish(() => {
          restored = editor.anchor.restore(saved);
          assert.deepEqual(restored.resolve(), {
            anchor: { path: [0, 0], offset: 2 },
            focus: { path: [0, 0], offset: 4 },
          });
          assert.throws(writeDraft, /finalized editor transaction/);
          assert.throws(
            () => editor.update.text.insert('?'),
            /nested|finalized/
          );
          events.push('resource:ready');
        });
        afterPublish(() => {
          events.push('resource:published');
        });
      },
    });
    const rejection = new Error('reject final document');
    const invalid = definePlugin('rollback-final-rejection', {
      dependencies: [resource],
      activate({ beforePublish, afterPublish, onCleanup }) {
        onCleanup(({ reason }) => {
          events.push(`rejection:${reason}`);
        });
        beforePublish(() => {
          throw rejection;
        });
        afterPublish(() => {
          events.push('rejection:published');
        });
      },
    });
    editor.subscribeCommit(() => {
      events.push('observer');
    });
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.text.insert('!', { at: { path: [0, 0], offset: 0 } });
          tx.selection.set({
            anchor: { path: [0, 0], offset: 2 },
            focus: { path: [0, 0], offset: 2 },
          });
          tx.plugins.reconfigure(slot, invalid);
          writeDraft = () => tx.text.insert('?');
        }),
      (error: unknown) => {
        assert.ok(error instanceof PluginPublicationError);
        assert.equal(error.cause, rejection);
        assert.equal(error.pluginName, invalid.name);
        assert.equal(error.phase, 'beforePublish');
        return true;
      }
    );
    assert.deepEqual(events, [
      'resource:ready',
      'rejection:rollback',
      'resource:rollback',
    ]);
    assert.deepEqual(editor.read.value(), snapshot);
    assert.equal(editor.read.selection(), null);
    assert.equal(editor.read.runtime.snapshot().version, version);
    assert.equal(getPluginRegistry(editor), registry);
    assert.equal(editor.plugin(previous).api.ready, true);
    assert.deepEqual(original.resolve(), range);
    assert.equal(restored?.resolve(), null);
    original.release();
    assert.equal(hasActiveAnchors(editor), false);
    editor.update.text.insert('?', { at: { path: [0, 0], offset: 4 } });
    assert.equal(editor.read.text.string([]), 'text?');
  });

  it('rejects constructor writes during final-document initialization', () => {
    let cleaned = false;
    assert.throws(
      () =>
        createEditor({
          initialValue: [paragraph('text')],
          plugins: [
            definePlugin('final-document-write', {
              activate({ editor, beforePublish, onCleanup }) {
                onCleanup(() => {
                  cleaned = true;
                });
                beforePublish(() => {
                  editor.update.text.insert('!');
                });
              },
            }),
          ],
        }),
      /plugin lifecycle publication/
    );
    assert.equal(cleaned, true);
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
      definePlugin('after-publish-after-observers', {
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
    const errors: Array<{ pluginName: string; phase: string }> = [];
    const editor = createEditor({
      lifecycleErrorSink(error) {
        errors.push({ pluginName: error.pluginName, phase: error.phase });
      },
    });

    const unsubscribe = editor.subscribeCommit(() => {
      throw new Error('observer failed');
    });
    const cleanup = editor.install(
      definePlugin('after-publish-after-observer-failure', {
        activate(context) {
          context.afterPublish(() => {
            afterPublishCalls += 1;
          });
        },
      })
    );

    assert.equal(afterPublishCalls, 1);
    assert.deepEqual(errors, [
      { pluginName: '$editor', phase: 'commit-listener' },
    ]);
    assert.deepEqual(
      getCompiledEditorConfiguration(editor).plugins.map(({ name }) => name),
      ['after-publish-after-observer-failure']
    );
    unsubscribe();
    cleanup();
    assert.deepEqual(getCompiledEditorConfiguration(editor).plugins, []);
  });

  it('does not let a stale cleanup remove a same-name replacement', () => {
    const plugin = (value: string) =>
      definePlugin('staleCleanupOwner', {
        read: () => ({ value: () => value }),
      });
    const editor = createEditor();
    const cleanupFirst = editor.install(plugin('first'));
    const cleanupSecond = editor.install(plugin('second'));

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
    const slot = definePluginSlot('portal-replacement-owner');
    const plugin = (value: string) =>
      definePlugin('portalReplacement', {
        api: () => ({ value: () => value }),
        read: () => ({ value: () => value }),
        update: () => ({ run: () => {} }),
      });
    const first = plugin('first');
    const second = plugin('second');
    const editor = createEditor({ plugins: [slot.of(first)] });
    const portal = editor.plugin(first);
    const capturedUpdate = portal.update;

    assert.equal(portal.api.value(), 'first');
    assert.equal(portal.read.value(), 'first');
    editor.update.plugins.reconfigure(slot, second);

    assert.equal(portal.installed, false);
    assert.throws(() => portal.api, /descriptor is no longer installed/);
    assert.throws(
      () => portal.read.value(),
      /descriptor is no longer installed/
    );
    assert.throws(
      () => capturedUpdate.run(),
      /descriptor is no longer installed/
    );
    assert.equal(editor.plugin(second).installed, true);
    assert.equal(editor.plugin(second).api.value(), 'second');
  });

  it('keeps a slot-owned plugin after explicit ownership is cleaned up', () => {
    const plugin = definePlugin('slotAndExplicitOwner', {
      read: () => ({ ready: () => true }),
    });
    const slot = definePluginSlot('slot-and-explicit-owner');
    const editor = createEditor({ plugins: [slot.of(plugin)] });
    const cleanupExplicit = editor.install(plugin);

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

  it('removes a shared slotted plugin after its last owner is removed', () => {
    const child = definePlugin('sharedSlottedChild', {
      read: () => ({ ready: () => true }),
    });
    const firstSlot = definePluginSlot('first-shared-slot-owner');
    const secondSlot = definePluginSlot('second-shared-slot-owner');
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
    const mode = definePluginPoint<string>('activation-order-mode');
    const slot = definePluginSlot('activation-order-mode');
    const lifecycle: string[] = [];
    const plugin = (value: string) =>
      definePlugin(`activation-order-mode-${value}`, {
        activate(context) {
          const { editor } = context;
          lifecycle.push(
            `activate:${value}:${getPluginContributions(editor, mode).at(-1) ?? 'missing'}`
          );
          context.onCleanup(() => lifecycle.push(`cleanup:${value}`));
        },
        contributions: [mode.of(value)],
      });
    const editor = createEditor({
      plugins: [slot.of(plugin('read'))] as const,
    });

    editor.update.plugins.reconfigure(slot, plugin('write'));

    assert.deepEqual(lifecycle, [
      'activate:read:read',
      'activate:write:write',
      'cleanup:read',
    ]);
  });

  it('runs abort and cleanup once in deterministic order', () => {
    const lifecycle: string[] = [];
    const editor = createEditor();
    const plugin = definePlugin('deterministic-cleanup', {
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
    const publication = preparePluginPublication(editor, plugin);

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
    const plugin = (revision: string) =>
      definePlugin('cleanup-reason-plugin', {
        activate(context) {
          context.onCleanup(({ reason }) =>
            lifecycle.push(`${revision}:${reason}`)
          );
        },
      });

    editor.install(plugin('first'));
    const removeSecond = editor.install(plugin('second'));
    removeSecond();

    const publication = preparePluginPublication(
      editor,
      definePlugin('cleanup-reason-provisional', {
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
    const errors: Array<{ pluginName: string; phase: string }> = [];
    const editor = createEditor({
      lifecycleErrorSink(error) {
        errors.push({ pluginName: error.pluginName, phase: error.phase });
      },
    });
    const publication = preparePluginPublication(
      editor,
      definePlugin('rollback-cleanup-failure', {
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
      { pluginName: 'rollback-cleanup-failure', phase: 'cleanup' },
    ]);
    assert.deepEqual(getCompiledEditorConfiguration(editor).plugins, []);
  });

  it('rejects thenables from every synchronous publication phase', () => {
    const errors: Array<{ pluginName: string; phase: string }> = [];
    const editor = createEditor({
      lifecycleErrorSink(error) {
        errors.push({ pluginName: error.pluginName, phase: error.phase });
      },
    });
    const registry = getPluginRegistry(editor);

    assert.throws(
      () =>
        editor.install(
          definePlugin('async-api-factory', {
            api: (() => Promise.resolve({})) as never,
          })
        ),
      /API must be synchronous/
    );
    assert.throws(
      () =>
        editor.install(
          definePlugin('async-configuration-validation', {
            validate: (() => Promise.resolve()) as never,
          })
        ),
      /validation must be synchronous/
    );
    assert.equal(getPluginRegistry(editor), registry);
    assert.deepEqual(getCompiledEditorConfiguration(editor).plugins, []);

    assert.throws(
      () =>
        editor.install(
          definePlugin('async-activation', {
            activate: (() => Promise.resolve()) as never,
          })
        ),
      PluginPublicationError
    );

    let beforePublishCleanups = 0;
    assert.throws(
      () =>
        editor.install(
          definePlugin('async-before-publication', {
            activate({ beforePublish, afterPublish, onCleanup }) {
              onCleanup(() => {
                beforePublishCleanups += 1;
              });
              // oxlint-disable-next-line typescript/no-misused-promises -- This negative test exercises the runtime guard against async lifecycle callbacks.
              beforePublish(() => Promise.resolve());
              afterPublish(() => {
                assert.fail('Failed preparation must not publish');
              });
            },
          })
        ),
      /before-publish callback must be synchronous/
    );
    assert.equal(beforePublishCleanups, 1);

    assert.deepEqual(errors, []);
    assert.deepEqual(getCompiledEditorConfiguration(editor).plugins, []);
  });

  it('isolates after-publish and cleanup failures through the lifecycle error sink', () => {
    const errors: Array<{ pluginName: string; phase: string }> = [];
    const editor = createEditor({
      lifecycleErrorSink(error) {
        errors.push({ pluginName: error.pluginName, phase: error.phase });
      },
    });
    const cleanup = editor.install(
      definePlugin('isolated-lifecycle-failures', {
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
        pluginName: 'isolated-lifecycle-failures',
        phase: 'afterPublish',
      },
      { pluginName: 'isolated-lifecycle-failures', phase: 'cleanup' },
    ]);
    assert.deepEqual(getCompiledEditorConfiguration(editor).plugins, []);
  });

  it('retains a required dependency until its consumer is removed', () => {
    const editor = createEditor();
    const dependency = definePlugin('retryable-cleanup-dependency', {});
    const cleanupDependency = editor.install(dependency);
    const cleanupDependent = editor.install(
      definePlugin('retryable-cleanup-dependent', {
        dependencies: [dependency],
      })
    );

    assert.doesNotThrow(cleanupDependency);
    assert.equal(getPluginRegistry(editor).plugins.has(dependency.name), true);
    cleanupDependent();
    assert.deepEqual(getCompiledEditorConfiguration(editor).plugins, []);
  });

  it('rejects a dependency descriptor that collides with an explicit installation', () => {
    const editor = createEditor();
    const explicit = definePlugin('dependency-identity-collision', {});
    const conflicting = definePlugin('dependency-identity-collision', {});
    const cleanup = editor.install(explicit);
    const registry = getPluginRegistry(editor);

    assert.throws(
      () =>
        editor.install(
          definePlugin('dependency-identity-consumer', {
            dependencies: [conflicting],
          })
        ),
      /multiple descriptor identities/
    );
    assert.equal(getPluginRegistry(editor), registry);
    assert.equal(registry.plugins.get(explicit.name)?.descriptor, explicit);

    cleanup();
    assert.deepEqual(getCompiledEditorConfiguration(editor).plugins, []);
  });

  it('reference-counts one transitive dependency across independent roots', () => {
    const lifecycle: string[] = [];
    const editor = createEditor();
    const dependency = definePlugin('shared-transitive-dependency', {
      activate(context) {
        lifecycle.push('dependency:activate');
        context.onCleanup(() => lifecycle.push('dependency:cleanup'));
      },
    });
    const first = definePlugin('first-transitive-root', {
      activate(context) {
        lifecycle.push('first:activate');
        context.onCleanup(() => lifecycle.push('first:cleanup'));
      },
      dependencies: [dependency],
    });
    const second = definePlugin('second-transitive-root', {
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
    assert.equal(getPluginRegistry(editor).plugins.has(dependency.name), true);
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
    assert.deepEqual(getCompiledEditorConfiguration(editor).plugins, []);
  });

  it('keeps every dependency edge topological across root permutations', () => {
    const descriptors: PluginReference[] = [];

    for (let index = 0; index < 32; index++) {
      descriptors.push(
        definePlugin(`permuted-dag-${index}`, {
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
    const installedSets = permutations.map((plugins) => {
      const editor = createEditor({ plugins });
      const installed = getCompiledEditorConfiguration(editor).plugins;
      const positions = new Map(
        installed.map((plugin, index) => [plugin.name, index])
      );

      for (const plugin of installed) {
        for (const dependency of plugin.dependencies ?? []) {
          assert.ok(
            positions.get(dependency.name)! < positions.get(plugin.name)!
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
    const first = preparePluginPublication(
      editor,
      definePlugin('first-candidate', {})
    );
    const stale = preparePluginPublication(
      editor,
      definePlugin('stale-candidate', {
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
      getCompiledEditorConfiguration(editor).plugins.map(({ name }) => name),
      ['first-candidate']
    );
  });
});
