import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runInNewContext } from 'node:vm';

import {
  createEditor,
  defineCommand,
  defineEditorExtension,
  defineEditorSchema,
  defineEffect,
  defineExtensionSlot,
  defineFacet,
  defineStateField,
  defineValueCodec,
  ElementApi,
  element,
  property,
  schema,
  type EditorExtension,
} from '@platejs/plite';
import {
  getCompiledEditorConfiguration,
  getEditorExtensionRegistry,
} from '@platejs/plite/internal';
import { prepareEditorExtensionPublication } from '../src/core/editor-extension';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

describe('transactional extension configuration', () => {
  it('publishes a dynamic extension migration and schema atomically', () => {
    const articleSchema = defineEditorSchema({
      elements: {
        paragraph: element({
          content: schema.content.text({ default: 'text', min: 1 }),
        }),
      },
      id: 'dynamic-schema-migration',
      root: schema.root({
        content: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      }),
      version: 1,
    });
    const editor = createEditor();
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
      () => editor.extend(articleSchema),
      /requires an explicit migration/u
    );
    assert.deepEqual(editor.read.children(), []);
    assert.equal(editor.read.schema.identity(), null);
    assert.deepEqual(observations, []);

    editor.extend(articleSchema, {
      migrate({ document, next }) {
        const child = next.createDefaultRootChild();

        assert.ok(child && ElementApi.isElement(child));

        return { ...document, children: [child] };
      },
    });

    const identity = editor.read.schema.identity();

    assert.deepEqual(editor.read.children(), [paragraph('')]);
    assert.equal(identity?.id, 'dynamic-schema-migration');
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
      defineEditorSchema({
        elements: {
          [type]: element({
            content: schema.content.text({ default: 'text', min: 1 }),
          }),
        },
        id: 'atomic-schema-migration',
        root: schema.root({
          content: schema.content.type(type, {
            default: { type },
            min: 1,
          }),
        }),
        version,
      });
    const beforeSchema = articleSchema(1, 'paragraph');
    const afterSchema = articleSchema(2, 'heading');
    const editor = createEditor({
      extensions: [slot.of(beforeSchema)] as const,
      initialValue: [paragraph('before')],
    });
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
    assert.equal(editor.read.schema.identity()?.version, 1);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      beforeRevision
    );
    assert.deepEqual(editor.read.children(), [paragraph('before')]);
    assert.deepEqual(commits, []);

    editor.update.extensions.reconfigure(slot, afterSchema, {
      migrate({ document, next }) {
        assert.equal(editor.read.schema.identity()?.version, 1);
        assert.equal(next.identity()?.version, 2);

        return {
          ...document,
          children: [
            {
              ...document.children[0]!,
              type: 'heading',
            },
          ],
        };
      },
    });

    assert.equal(editor.read.schema.identity()?.version, 2);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      beforeRevision + 1
    );
    const publishedIdentity = editor.read.schema.identity();

    assert.equal(publishedIdentity?.id, 'atomic-schema-migration');
    assert.equal(publishedIdentity?.version, 2);
    assert.match(publishedIdentity?.fingerprint ?? '', /^fnv1a64:/u);
    assert.deepEqual(editor.read.children(), [
      { children: [{ text: 'before' }], type: 'heading' },
    ]);
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
      defineEditorSchema({
        elements: {
          [type]: element({
            content: schema.content.text({ default: 'text', min: 1 }),
          }),
        },
        id: 'schema-migration-after-write',
        root: schema.root({
          content: schema.content.type(type, {
            default: { type },
            min: 1,
          }),
        }),
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
                ...document.children[0]!,
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
      defineEditorSchema({
        elements: {
          [type]: element({
            content: schema.content.text({ default: 'text', min: 1 }),
          }),
        },
        id: 'failed-schema-migration',
        root: schema.root({
          content: schema.content.type(type, {
            default: { type },
            min: 1,
          }),
        }),
        version,
      });
    const editor = createEditor({
      extensions: [
        slot.of(articleSchema(1, 'paragraph')),
        defineEditorExtension({
          effects: [effect],
          name: 'failed-schema-migration-effect',
        }),
      ] as const,
      initialValue: [paragraph('before')],
    });
    const previousRegistry = getEditorExtensionRegistry(editor);
    const previousRevision = getCompiledEditorConfiguration(editor).revision;
    let commits = 0;

    editor.subscribeCommit(() => commits++);

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
    assert.equal(editor.read.schema.identity()?.version, 1);
    assert.deepEqual(editor.read.children(), [paragraph('before')]);
    assert.equal(editor.read.lastCommit(), null);
    assert.equal(commits, 0);
  });

  it('does not invoke migration for equivalent schema configuration', () => {
    const slot = defineExtensionSlot('equivalent-schema-migration');
    const createSchema = () =>
      defineEditorSchema({
        elements: {
          paragraph: element({
            content: schema.content.text({ default: 'text', min: 1 }),
          }),
        },
        id: 'equivalent-schema-migration',
        root: schema.root({
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
        }),
        version: 1,
      });
    const editor = createEditor({
      extensions: [slot.of(createSchema())] as const,
      initialValue: [paragraph('same')],
    });
    let migrations = 0;
    let commits = 0;

    editor.subscribeCommit(() => commits++);
    editor.update.extensions.reconfigure(slot, createSchema(), {
      migrate({ document }) {
        migrations++;
        return document;
      },
    });

    assert.equal(migrations, 0);
    assert.equal(commits, 0);
    assert.equal(editor.read.lastCommit(), null);
  });

  it('requires an explicit migration when candidate root defaults change the document', () => {
    const slot = defineExtensionSlot('explicit-root-default-migration');
    const articleSchema = (version: number, minimum: number) =>
      defineEditorSchema({
        elements: {
          paragraph: element({
            content: schema.content.text({ default: 'text', min: 1 }),
          }),
        },
        id: 'explicit-root-default-migration',
        root: schema.root({
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: minimum,
          }),
        }),
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
    editor.subscribeCommit(() => commits++);

    assert.throws(
      () => editor.update.extensions.reconfigure(slot, articleSchema(2, 1)),
      /requires an explicit migration/u
    );
    assert.deepEqual(editor.read.children(), []);
    assert.equal(editor.read.schema.identity()?.version, 1);
    assert.equal(
      getCompiledEditorConfiguration(editor).revision,
      beforeRevision
    );
    assert.equal(commits, 0);

    editor.update.extensions.reconfigure(slot, articleSchema(2, 1), {
      migrate({ document, next }) {
        const child = next.createDefaultRootChild();

        assert.ok(child && ElementApi.isElement(child));

        return { ...document, children: [child] };
      },
    });

    assert.deepEqual(editor.read.children(), [paragraph('')]);
    assert.equal(editor.read.schema.identity()?.version, 2);
    assert.equal(commits, 1);
  });

  it('activates initial extensions before exposing their state groups', () => {
    let active = false;
    const extension = defineEditorExtension({
      activate() {
        active = true;
      },
      name: 'initial-activation-state',
      state: {
        lifecycle() {
          if (!active) throw new Error('Initial extension is not active.');

          return { active: () => active };
        },
      },
    });
    const editor = createEditor({ extensions: [extension] as const });

    assert.equal(editor.read.lifecycle.active(), true);
  });

  it('stages reconfiguration until one committed configuration revision', () => {
    const mode = defineFacet<string, string>({
      combine: (values) => values.at(-1) ?? 'missing',
      key: 'configuration-mode',
    });
    const slot = defineExtensionSlot('configuration-mode');
    let activations = 0;
    const extension = (value: string) =>
      defineEditorExtension({
        facets: [mode.of(value)],
        name: `configuration-mode-${value}`,
        activate() {
          activations++;
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
      defineEditorExtension({
        facets: [mode.of(value)],
        name: `aborted-configuration-mode-${value}`,
        activate() {
          activations++;
        },
      });
    const editor = createEditor({
      extensions: [slot.of(extension('read'))] as const,
    });
    const revision = getCompiledEditorConfiguration(editor).revision;

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

  it('publishes document and configuration before isolating activation failure', () => {
    const mode = defineFacet<string>({ key: 'failed-configuration-mode' });
    const slot = defineExtensionSlot('failed-configuration-mode');
    const lifecycle: string[] = [];
    const errors: Array<{ extension: string; phase: string }> = [];
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
          defineEditorExtension({
            activate(_editor, context) {
              lifecycle.push('old:activate');
              context.onCleanup(() => lifecycle.push('old:cleanup'));
            },
            facets: [mode.of('read')],
            name: 'failed-configuration-mode-read',
          })
        ),
      ] as const,
      initialValue: [paragraph('before')],
      lifecycleErrorSink(error) {
        errors.push({ extension: error.extension, phase: error.phase });
      },
    });
    const revision = getCompiledEditorConfiguration(editor).revision;
    const registry = getEditorExtensionRegistry(editor);

    editor.subscribeCommit((commit) => {
      committedStates.push({
        field: editor.read.getField(persisted),
        revision: getCompiledEditorConfiguration(editor).revision,
        stateChanged: commit.changed.has('state'),
      });
    });

    editor.update((tx) => {
      tx.text.insert('!', { at: { offset: 6, path: [0, 0] } });
      tx.extensions.reconfigure(
        slot,
        defineEditorExtension({
          activate(runtimeEditor, context) {
            lifecycle.push(
              `new:activate:${runtimeEditor.read.facet(mode).join(',')}:${runtimeEditor.read.text.string([])}`
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
          facets: [mode.of('write')],
          fields: [persisted],
          name: 'failed-configuration-mode-write',
        })
      );
    });

    assert.equal(editor.read.text.string([]), 'before!');
    assert.equal(editor.read.getField(persisted), 'installed');
    assert.deepEqual(editor.read.value().meta?.[persisted.key], {
      value: 'installed',
      version: 1,
    });
    assert.deepEqual(editor.read.facet(mode), ['write']);
    assert.equal(getCompiledEditorConfiguration(editor).revision, revision + 1);
    assert.notEqual(getEditorExtensionRegistry(editor), registry);
    assert.deepEqual(errors, [
      { extension: 'failed-configuration-mode-write', phase: 'activate' },
    ]);
    assert.deepEqual(committedStates, [
      { field: 'installed', revision: revision + 1, stateChanged: true },
    ]);
    assert.deepEqual(lifecycle, [
      'old:activate',
      'new:activate:write:before!',
      'new:abort',
      'new:cleanup:second:rollback',
      'new:cleanup:first:rollback',
      'old:cleanup',
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
          defineEditorExtension({
            activate(_editor, context) {
              previousSignal = context.signal;
              context.onCleanup(({ reason }) =>
                lifecycle.push(`previous:${reason}`)
              );
            },
            facets: [mode.of('previous')],
            name: 'post-publication-previous',
          })
        ),
      ] as const,
    });
    const previousRegistry = getEditorExtensionRegistry(editor);
    const previousRevision = getCompiledEditorConfiguration(editor).revision;
    const publication = prepareEditorExtensionPublication(
      editor,
      slot.of(
        defineEditorExtension({
          activate(_editor, context) {
            provisionalSignal = context.signal;
            context.onCleanup(({ reason }) =>
              lifecycle.push(`provisional:${reason}`)
            );
          },
          facets: [mode.of('provisional')],
          name: 'post-publication-provisional',
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
    assert.equal(provisionalSignal, undefined);
    assert.deepEqual(lifecycle, []);
  });

  it('keeps published configuration when one activation fails', () => {
    const mode = defineFacet<string>({ key: 'partial-activation-mode' });
    const slot = defineExtensionSlot('partial-activation-mode');
    const lifecycle: string[] = [];
    const errors: Array<{ extension: string; phase: string }> = [];
    const commits: number[] = [];
    const editor = createEditor({
      extensions: [
        slot.of(
          defineEditorExtension({
            activate(_editor, context) {
              context.onCleanup(() => lifecycle.push('old:cleanup'));
            },
            facets: [mode.of('read')],
            name: 'partial-activation-old',
          })
        ),
      ] as const,
      initialValue: [paragraph('before')],
      lifecycleErrorSink(error) {
        errors.push({ extension: error.extension, phase: error.phase });
      },
    });
    const registry = getEditorExtensionRegistry(editor);
    const revision = getCompiledEditorConfiguration(editor).revision;

    editor.subscribeCommit((commit) => commits.push(commit.version));

    editor.update((tx) => {
      tx.text.insert('!', { at: { offset: 6, path: [0, 0] } });
      tx.extensions.reconfigure(slot, [
        defineEditorExtension({
          activate(_editor, context) {
            lifecycle.push('a:activate');
            context.signal.addEventListener('abort', () => {
              lifecycle.push('a:abort');
            });
            context.onCleanup(({ reason }) => {
              lifecycle.push(`a:cleanup:${reason}`);
            });
          },
          facets: [mode.of('write')],
          name: 'partial-activation-a',
        }),
        defineEditorExtension({
          activate() {
            lifecycle.push('b:activate');
            throw new Error('second activation failed');
          },
          dependencies: ['partial-activation-a'],
          name: 'partial-activation-b',
        }),
      ]);
    });

    assert.equal(editor.read.text.string([]), 'before!');
    assert.deepEqual(editor.read.facet(mode), ['write']);
    assert.notEqual(getEditorExtensionRegistry(editor), registry);
    assert.equal(getCompiledEditorConfiguration(editor).revision, revision + 1);
    assert.deepEqual(commits, [1]);
    assert.deepEqual(errors, [
      { extension: 'partial-activation-b', phase: 'activate' },
    ]);
    assert.deepEqual(lifecycle, ['a:activate', 'b:activate', 'old:cleanup']);
  });

  it('rejects invalid dependencies without exposing a partial registry', () => {
    const mode = defineFacet<string>({ key: 'dependency-configuration-mode' });
    const slot = defineExtensionSlot('dependency-configuration-mode');
    const editor = createEditor({
      extensions: [
        slot.of(
          defineEditorExtension({
            facets: [mode.of('read')],
            name: 'dependency-configuration-mode-read',
          })
        ),
      ] as const,
    });

    assert.throws(() => {
      editor.update.extensions.reconfigure(
        slot,
        defineEditorExtension({
          dependencies: ['missing-extension'],
          name: 'dependency-configuration-mode-write',
        })
      );
    }, /missing dependency "missing-extension"/);

    assert.deepEqual(editor.read.facet(mode), ['read']);
  });

  it('validates a detached candidate without changing the live registry', () => {
    const editor = createEditor({
      extensions: [
        defineEditorExtension({ name: 'detached-candidate-base' }),
      ] as const,
    });
    const registry = getEditorExtensionRegistry(editor);
    const revision = getCompiledEditorConfiguration(editor).revision;
    let apiFactories = 0;
    let activations = 0;

    assert.throws(
      () =>
        prepareEditorExtensionPublication(
          editor,
          defineEditorExtension({
            api() {
              apiFactories++;
              return {};
            },
            activate() {
              activations++;
            },
            dependencies: ['missing-detached-dependency'],
            name: 'invalid-detached-candidate',
          })
        ),
      /missing dependency "missing-detached-dependency"/
    );

    assert.equal(apiFactories, 0);
    assert.equal(activations, 0);
    assert.equal(getEditorExtensionRegistry(editor), registry);
    assert.equal(getCompiledEditorConfiguration(editor).revision, revision);
  });

  it('exposes published registry collections as immutable', () => {
    const command = defineCommand<{ type: 'immutable-command' }>(
      'immutable-command'
    );
    const effect = defineEffect({ key: 'immutable-effect' });
    const field = defineStateField({ key: 'immutable-field' });
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          commands: [command.handle(() => false)],
          effects: [effect],
          fields: [field],
          name: 'immutable-registry',
          schema: defineEditorSchema({
            elements: { 'immutable-element': element({}) },
            id: 'immutable-registry',
            properties: [
              schema.textProperty('immutable-property', property.boolean()),
            ],
            root: schema.root({
              content: schema.content.type('immutable-element'),
            }),
            version: 1,
          }).schema,
          state: { immutableState: () => ({}) },
          tx: { immutableTx: () => ({}) },
        }),
      ],
    });
    const registry = getEditorExtensionRegistry(editor);
    const registrations = [
      registry.commands.get(command.type)?.[0],
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
      registry.stateGroups.get('immutableState'),
      registry.txGroups.get('immutableTx'),
    ];

    assert.throws(
      () => registry.extensions.delete('immutable-registry'),
      /registries are immutable/
    );
    assert.throws(
      () => registry.schemaContributions.records.delete('immutable-registry'),
      /registries are immutable/
    );
    assert.equal(registry.extensions.has('immutable-registry'), true);
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
    const canonical = defineEditorExtension({
      name: 'canonical-schema-declaration',
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
      defineEditorExtension({
        name,
        schema: defineEditorSchema({
          elements: { 'equivalent-schema-element': element({}) },
          id: 'equivalent-schema',
          root: schema.root({
            content: schema.content.type('equivalent-schema-element'),
          }),
          version: 1,
        }).schema,
      });
    const editor = createEditor({
      extensions: [slot.of(extension('equivalent-schema-first'))] as const,
    });
    const schemaRevision = getEditorExtensionRegistry(editor).schemaRevision;

    editor.update.extensions.reconfigure(
      slot,
      extension('equivalent-schema-second')
    );

    assert.equal(
      getEditorExtensionRegistry(editor).schemaRevision,
      schemaRevision
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
            groups: ["block"],
            properties: {
              payload: {
                default: { nested: ["foreign"] },
                equality: "structural",
                kind: "json",
                omitDefault: false
              }
            }
          }
        },
        groups: {},
        properties: [{
          inclusive: true,
          key: "tone",
          placement: "text",
          split: "preserve",
          target: { kind: "type", type: "paragraph" },
          typeChange: "drop",
          value: {
            equality: "structural",
            kind: "string",
            omitDefault: false
          }
        }],
        root: {
          content: {
            allowed: { group: "block", kind: "group" },
            default: { type: "paragraph" },
            min: 1
          }
        },
        roots: {}
      }
    })`) as EditorExtension;
    const canonical = defineEditorExtension(source);
    const schemaDeclaration = canonical.schema;
    const paragraphElement = schemaDeclaration?.elements.paragraph;
    const content = paragraphElement?.content;
    const payloadProperty = paragraphElement?.properties?.payload;
    const textProperty = schemaDeclaration?.properties[0];

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
        (payloadProperty?.default as { nested: unknown[] }).nested
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
      (payloadProperty?.default as { nested: unknown[] }).nested,
      schemaDeclaration?.root,
      schemaDeclaration?.properties,
      textProperty,
      textProperty?.target,
    ]) {
      assert.equal(Object.isFrozen(declaration), true);
    }

    (
      source.schema?.elements.paragraph as {
        content: { min: number };
      }
    ).content.min = 2;
    assert.equal(content?.min, 1);
  });

  it('activates with only immutable configuration resources and lifecycle controls', () => {
    const contexts: string[][] = [];
    const capabilities: string[][] = [];
    const editor = createEditor();

    editor.extend([
      defineEditorExtension({
        api: { probe: 'first' },
        name: 'activation-context-first',
      }),
      defineEditorExtension({
        activate(_editor, context) {
          contexts.push(Object.keys(context).sort());
          capabilities.push([...context.capabilities<string>('probe')]);
          assert.equal(typeof context.schema.validateDocument, 'function');
          assert.equal(Object.isFrozen(context), true);
          assert.equal(Object.isFrozen(context.options), true);
        },
        api: { probe: 'second' },
        name: 'activation-context-second',
        options: { mode: 'strict' },
      }),
    ]);

    assert.deepEqual(contexts, [
      [
        'capabilities',
        'name',
        'onCleanup',
        'onReady',
        'options',
        'root',
        'schema',
        'signal',
      ],
    ]);
    assert.deepEqual(capabilities, [['first', 'second']]);
  });

  it('resolves API factories against a guarded candidate before publication', () => {
    const mode = defineFacet<string>({ key: 'api-factory-mode' });
    const editor = createEditor();
    const registry = getEditorExtensionRegistry(editor);
    let factoryCalls = 0;
    let observedCapabilities: readonly string[] = [];
    const publication = prepareEditorExtensionPublication(editor, [
      defineEditorExtension({
        api: { candidateSeed: 'visible' },
        name: 'candidate-api-seed',
      }),
      defineEditorExtension({
        api(runtimeEditor, context) {
          factoryCalls++;
          assert.deepEqual(runtimeEditor.read.facet(mode), []);
          assert.deepEqual(context.capabilities<string>('candidateSeed'), [
            'visible',
          ]);
          assert.throws(
            () => runtimeEditor.update(() => {}),
            /writes cannot be started during extension lifecycle publication/
          );

          return { factoryProbe: 'visible' };
        },
        dependencies: ['candidate-api-seed'],
        facets: [mode.of('provisional')],
        name: 'candidate-api-factory',
      }),
      defineEditorExtension({
        activate(_editor, context) {
          observedCapabilities = context.capabilities<string>('factoryProbe');
        },
        dependencies: ['candidate-api-factory'],
        name: 'candidate-api-consumer',
      }),
    ]);

    assert.equal(factoryCalls, 1);
    assert.equal(getEditorExtensionRegistry(editor), registry);
    assert.deepEqual(editor.read.facet(mode), []);
    publication.stage();
    publication.commit();
    assert.deepEqual(observedCapabilities, []);
    publication.finalize();
    assert.deepEqual(observedCapabilities, ['visible']);
  });

  it('resolves peer API factories against the same declarative candidate', () => {
    const run = (reverse: boolean) => {
      const observed: Record<string, readonly string[]> = {};
      const left = defineEditorExtension({
        api(_editor, context) {
          observed.left = context.capabilities<string>('generated');

          return { generated: 'left' };
        },
        name: 'factory-left',
        peerDependencies: ['factory-right'],
      });
      const right = defineEditorExtension({
        api(_editor, context) {
          observed.right = context.capabilities<string>('generated');

          return { generated: 'right' };
        },
        name: 'factory-right',
        peerDependencies: ['factory-left'],
      });
      const editor = createEditor({
        extensions: reverse ? [right, left] : [left, right],
      });

      return {
        observed,
        published: [
          ...(getEditorExtensionRegistry(editor).capabilities.get(
            'generated'
          ) ?? []),
        ].sort(),
      };
    };

    assert.deepEqual(run(false), {
      observed: { left: [], right: [] },
      published: ['left', 'right'],
    });
    assert.deepEqual(run(true), {
      observed: { left: [], right: [] },
      published: ['left', 'right'],
    });
  });

  it('recomputes installed API factories for each configuration candidate', () => {
    let factoryCalls = 0;
    const editor = createEditor({
      extensions: [
        defineEditorExtension({
          api(_editor, context) {
            factoryCalls++;

            return {
              derived: context.capabilities<string>('declarative').join(','),
            };
          },
          name: 'recomputed-api-factory',
        }),
      ],
    });

    assert.equal(factoryCalls, 1);
    assert.equal(editor.api.derived, '');

    const remove = editor.extend(
      defineEditorExtension({
        api: { declarative: 'seed' },
        name: 'declarative-api-seed',
      })
    );

    assert.equal(factoryCalls, 2);
    assert.equal(editor.api.derived, 'seed');

    remove();

    assert.equal(factoryCalls, 3);
    assert.equal(editor.api.derived, '');
  });

  it('isolates nested editor writes during activation', () => {
    const errors: Array<{ extension: string; phase: string }> = [];
    const editor = createEditor({
      lifecycleErrorSink(error) {
        errors.push({ extension: error.extension, phase: error.phase });
      },
    });
    const registry = getEditorExtensionRegistry(editor);

    const cleanup = editor.extend(
      defineEditorExtension({
        activate(runtimeEditor) {
          runtimeEditor.update(() => {});
        },
        name: 'nested-activation-write',
      })
    );

    assert.notEqual(getEditorExtensionRegistry(editor), registry);
    assert.deepEqual(errors, [
      { extension: 'nested-activation-write', phase: 'activate' },
    ]);
    assert.deepEqual(
      getCompiledEditorConfiguration(editor).extensions.map(({ name }) => name),
      ['nested-activation-write']
    );

    cleanup();
  });

  it('rejects nested editor writes during cleanup', () => {
    const errors: unknown[] = [];
    const editor = createEditor({
      lifecycleErrorSink(error) {
        errors.push(error.cause);
      },
    });
    const cleanup = editor.extend(
      defineEditorExtension({
        activate(runtimeEditor, context) {
          context.onCleanup(() => runtimeEditor.update(() => {}));
        },
        name: 'nested-cleanup-write',
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
    const revision = getCompiledEditorConfiguration(editor).revision;
    const lifecycle: string[] = [];
    let observerCalls = 0;

    editor.subscribeCommit(() => observerCalls++);

    assert.throws(
      () =>
        prepareEditorExtensionPublication(editor, [
          defineEditorExtension({
            api: { invalidCandidateApi: 'hidden' },
            name: 'invalid-candidate-api',
          }),
          defineEditorExtension({
            activate() {
              lifecycle.push('activate');
            },
            dependencies: ['invalid-candidate-api'],
            name: 'invalid-configuration-phase',
            validateConfiguration({
              capabilities,
              editor: candidateEditor,
              name,
            }) {
              assert.equal(candidateEditor, editor);
              assert.deepEqual(capabilities<string>('invalidCandidateApi'), [
                'hidden',
              ]);
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
    assert.equal('invalidCandidateApi' in editor.api, false);
    assert.equal(observerCalls, 0);
  });

  it('identifies the configuration owner without permitting validation writes', () => {
    const editor = createEditor();

    assert.throws(
      () =>
        editor.extend(
          defineEditorExtension({
            name: 'configuration-owner-write-guard',
            validateConfiguration({ editor: owner }) {
              assert.equal(owner, editor);
              owner.update.selection.clear();
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
      defineEditorExtension({
        activate(editor) {
          activationRevisions.push(
            getCompiledEditorConfiguration(editor).revision
          );
          assert.equal(editor.read.facet(mode), value);
        },
        facets: [mode.of(value)],
        name: `atomic-observer-mode-${value}`,
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

  it('runs ready work after commit observers and allows a new update', () => {
    const events: string[] = [];
    const editor = createEditor({ initialValue: [paragraph('before')] });

    editor.subscribeCommit((commit) => {
      events.push(
        commit.dirtyStateKeys.includes('$configuration')
          ? 'observer:configuration'
          : 'observer:document'
      );
    });
    editor.extend(
      defineEditorExtension({
        activate(_editor, context) {
          events.push('activate');
          context.onReady(() => {
            events.push('ready');
            editor.update((tx) => {
              tx.text.insert('!', { at: { offset: 6, path: [0, 0] } });
            });
          });
        },
        name: 'ready-after-observers',
      })
    );

    assert.deepEqual(events, [
      'activate',
      'observer:configuration',
      'ready',
      'observer:document',
    ]);
    assert.equal(editor.read.text.string([]), 'before!');
  });

  it('runs ready exactly once when a commit observer throws', () => {
    let readyCalls = 0;
    const editor = createEditor();

    editor.subscribeCommit(() => {
      throw new Error('observer failed');
    });

    assert.throws(
      () =>
        editor.extend(
          defineEditorExtension({
            activate(_editor, context) {
              context.onReady(() => {
                readyCalls++;
              });
            },
            name: 'ready-after-observer-failure',
          })
        ),
      /observer failed/
    );

    assert.equal(readyCalls, 1);
    assert.deepEqual(
      getCompiledEditorConfiguration(editor).extensions.map(({ name }) => name),
      ['ready-after-observer-failure']
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
      defineEditorExtension({
        activate(editor, context) {
          lifecycle.push(`activate:${value}:${editor.read.facet(mode)}`);
          context.onCleanup(() => lifecycle.push(`cleanup:${value}`));
        },
        facets: [mode.of(value)],
        name: `activation-order-mode-${value}`,
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
    const extension = defineEditorExtension({
      activate(_editor, context) {
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
      name: 'deterministic-cleanup',
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
      defineEditorExtension({
        activate(_editor, context) {
          context.onCleanup(({ reason }) =>
            lifecycle.push(`${revision}:${reason}`)
          );
        },
        name: 'cleanup-reason-extension',
      });

    editor.extend(extension('first'));
    const removeSecond = editor.extend(extension('second'));
    removeSecond();

    const publication = prepareEditorExtensionPublication(
      editor,
      defineEditorExtension({
        activate(_editor, context) {
          context.onCleanup(({ reason }) =>
            lifecycle.push(`provisional:${reason}`)
          );
        },
        name: 'cleanup-reason-provisional',
      })
    );
    publication.stage();
    publication.commit();
    publication.rollback();

    assert.deepEqual(lifecycle, ['first:replace', 'second:remove']);
  });

  it('rejects thenables from every synchronous publication phase', () => {
    const errors: Array<{ extension: string; phase: string }> = [];
    const editor = createEditor({
      lifecycleErrorSink(error) {
        errors.push({ extension: error.extension, phase: error.phase });
      },
    });
    const registry = getEditorExtensionRegistry(editor);

    assert.throws(
      () =>
        editor.extend(
          defineEditorExtension({
            api: (() => Promise.resolve({})) as never,
            name: 'async-api-factory',
          })
        ),
      /API factory must be synchronous/
    );
    assert.throws(
      () =>
        editor.extend(
          defineEditorExtension({
            name: 'async-configuration-validation',
            validateConfiguration: (() => Promise.resolve()) as never,
          })
        ),
      /configuration validation must be synchronous/
    );
    assert.equal(getEditorExtensionRegistry(editor), registry);
    assert.deepEqual(getCompiledEditorConfiguration(editor).extensions, []);

    const cleanup = editor.extend(
      defineEditorExtension({
        activate: (() => Promise.resolve()) as never,
        name: 'async-activation',
      })
    );

    assert.deepEqual(errors, [
      { extension: 'async-activation', phase: 'activate' },
    ]);
    assert.deepEqual(
      getCompiledEditorConfiguration(editor).extensions.map(({ name }) => name),
      ['async-activation']
    );

    cleanup();
  });

  it('isolates ready and cleanup failures through the lifecycle error sink', () => {
    const errors: Array<{ extension: string; phase: string }> = [];
    const editor = createEditor({
      lifecycleErrorSink(error) {
        errors.push({ extension: error.extension, phase: error.phase });
      },
    });
    const cleanup = editor.extend(
      defineEditorExtension({
        activate(_editor, context) {
          context.onReady(() => {
            throw new Error('ready failed');
          });
          context.onCleanup((() => Promise.resolve()) as never);
        },
        name: 'isolated-lifecycle-failures',
      })
    );

    assert.doesNotThrow(cleanup);
    assert.deepEqual(errors, [
      { extension: 'isolated-lifecycle-failures', phase: 'ready' },
      { extension: 'isolated-lifecycle-failures', phase: 'cleanup' },
    ]);
    assert.deepEqual(getCompiledEditorConfiguration(editor).extensions, []);
  });

  it('retries a failed cleanup transaction', () => {
    const editor = createEditor();
    const cleanupDependency = editor.extend(
      defineEditorExtension({ name: 'retryable-cleanup-dependency' })
    );
    const cleanupDependent = editor.extend(
      defineEditorExtension({
        dependencies: ['retryable-cleanup-dependency'],
        name: 'retryable-cleanup-dependent',
      })
    );

    assert.throws(cleanupDependency, /missing dependency/);
    cleanupDependent();
    assert.doesNotThrow(cleanupDependency);
    assert.deepEqual(getCompiledEditorConfiguration(editor).extensions, []);
  });

  it('rejects a stale prepared candidate without activating it', () => {
    const editor = createEditor();
    let staleActivations = 0;
    const first = prepareEditorExtensionPublication(
      editor,
      defineEditorExtension({ name: 'first-candidate' })
    );
    const stale = prepareEditorExtensionPublication(
      editor,
      defineEditorExtension({
        activate() {
          staleActivations++;
        },
        name: 'stale-candidate',
      })
    );

    first.stage();
    stale.stage();
    first.commit();
    first.finalize();

    assert.throws(() => stale.commit(), /publication is stale/);
    assert.equal(staleActivations, 0);
    assert.deepEqual(
      getCompiledEditorConfiguration(editor).extensions.map(({ name }) => name),
      ['first-candidate']
    );
  });
});
