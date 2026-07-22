import { property, schema } from '@platejs/plite';

import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import {
  getPlateModelPublication,
  withCompiledPlatePluginApiCandidate,
  withCompiledPlatePluginCandidate,
} from './compilePlateModel';
import { prepareParserRegistry } from './prepareParserRegistry';

const createRevisionFixture = () => {
  const calls = {
    api: 0,
    runtime: 0,
    tx: 0,
  };
  const writes: string[] = [];
  const plugin = createBasePlugin({
    config: {
      childType: 'p',
      enabled: true,
      label: 'one',
    },
    key: 'revisioned',
    schema: ({ config }) => ({
      element: {
        content: schema.content.type(config.childType, {
          default: { type: config.childType },
          min: 1,
        }),
      },
    }),
  })
    .extend(({ plugin }) => {
      calls.runtime++;

      return {
        options: { label: plugin.config.label },
      };
    })
    .extendApi(({ plugin }) => {
      calls.api++;

      return {
        current: () => plugin.config.label,
        ...(plugin.config.enabled
          ? { removable: () => `api:${plugin.config.label}` }
          : {}),
      };
    })
    .extendTx(({ plugin }) => {
      calls.tx++;

      return () => ({
        nested: {
          write: () => {
            writes.push(`nested:${plugin.config.label}`);
          },
        },
        write: () => {
          writes.push(plugin.config.label);
        },
        ...(plugin.config.enabled
          ? {
              removableWrite: () => {
                writes.push(`removable:${plugin.config.label}`);
              },
            }
          : {}),
      });
    })
    .extendSelectors(({ getOptions, plugin }) => {
      const eagerLabel = getOptions().label;

      return {
        configuredLabel: () => `${plugin.config.label}:${getOptions().label}`,
        eagerConfiguredLabel: () => `${plugin.config.label}:${eagerLabel}`,
      };
    })
    .configure({
      shortcuts: {
        current: { keys: 'mod+k' },
      },
    });

  return { calls, plugin, writes };
};

describe('Plate model publication', () => {
  it('keeps a held plugin context live across one atomic configuration revision', () => {
    const { calls, plugin, writes } = createRevisionFixture();
    const editor = createBaseEditor({ plugins: [plugin] });
    const context = editor.plugin(plugin);
    const beforePublication = getPlateModelPublication(editor)!;
    const beforePlugin = context.plugin;
    const optionsStore = editor.getOptionsStore(plugin);

    expect(context.plugin.config.label).toBe('one');
    expect(context.type).toBe('revisioned');
    expect(context.getOptions().label).toBe('one');
    expect(context.api.current()).toBe('one');
    expect(calls).toEqual({ api: 1, runtime: 1, tx: 1 });

    context.update.write();

    expect(writes).toEqual(['one']);
    expect(calls).toEqual({ api: 1, runtime: 1, tx: 1 });

    editor.configure(plugin, { label: 'two' });

    expect(getPlateModelPublication(editor)).not.toBe(beforePublication);
    expect(context.plugin).not.toBe(beforePlugin);
    expect(context.plugin.config.label).toBe('two');
    expect(context.type).toBe('revisioned');
    expect(editor.getOptionsStore(plugin)).toBe(optionsStore);
    expect(context.getOptions().label).toBe('two');
    expect(context.api.current()).toBe('two');

    context.update.write();
    context.update.nested.write();

    expect(writes).toEqual(['one', 'two', 'nested:two']);
    expect(calls).toEqual({ api: 2, runtime: 2, tx: 2 });
  });

  it('preserves the exact published revision and live behavior when configuration fails', () => {
    const { calls, plugin, writes } = createRevisionFixture();
    const editor = createBaseEditor({ plugins: [plugin] });
    const context = editor.plugin(plugin);
    const publication = getPlateModelPublication(editor)!;
    const publishedPlugin = context.plugin;
    const optionsStore = editor.getOptionsStore(plugin);

    expect(() =>
      editor.configure(plugin, { childType: 'missing-child' })
    ).toThrow();

    expect(getPlateModelPublication(editor)).toBe(publication);
    expect(context.plugin).toBe(publishedPlugin);
    expect(editor.getOptionsStore(plugin)).toBe(optionsStore);
    expect(context.plugin.config.childType).toBe('p');
    expect(context.getOptions().label).toBe('one');
    expect(context.api.current()).toBe('one');

    context.update.write();

    expect(writes).toEqual(['one']);
    expect(calls).toEqual({ api: 2, runtime: 2, tx: 2 });
  });

  it('does not rebuild an equivalent immutable configuration', () => {
    const { calls, plugin } = createRevisionFixture();
    const editor = createBaseEditor({ plugins: [plugin] });
    const context = editor.plugin(plugin);
    const publication = getPlateModelPublication(editor)!;
    const publishedPlugin = context.plugin;
    const optionsStore = editor.getOptionsStore(plugin);

    editor.configure(plugin, { label: 'one' });

    expect(getPlateModelPublication(editor)).toBe(publication);
    expect(context.plugin).toBe(publishedPlugin);
    expect(editor.getOptionsStore(plugin)).toBe(optionsStore);
    expect(calls).toEqual({ api: 1, runtime: 1, tx: 1 });
  });

  it('snapshots schema identity instead of retaining mutable caller input', () => {
    const { plugin } = createRevisionFixture();
    const identity = {
      id: 'plate-test:core:internal-plugin-identity-snapshot',
      version: 1,
    };
    const editor = createBaseEditor({ plugins: [plugin], schema: identity });

    identity.id = 'mutated';
    identity.version = 2;
    editor.configure(plugin, { label: 'two' });

    expect(getPlateModelPublication(editor)?.identity).toEqual({
      id: 'plate-test:core:internal-plugin-identity-snapshot',
      version: 1,
    });
    expect(Object.isFrozen(getPlateModelPublication(editor)?.identity)).toBe(
      true
    );
    expect(editor.read.schema.identity()).toMatchObject({
      id: 'plate-test:core:internal-plugin-identity-snapshot',
      version: 1,
    });
  });

  it('removes configured API and transaction capabilities from a held context', () => {
    const { plugin, writes } = createRevisionFixture();
    const editor = createBaseEditor({ plugins: [plugin] });
    const context = editor.plugin(plugin);

    expect(
      Reflect.apply(
        Reflect.get(context.api, 'removable') as Function,
        undefined,
        []
      )
    ).toBe('api:one');
    Reflect.apply(
      Reflect.get(context.update, 'removableWrite') as Function,
      undefined,
      []
    );

    editor.configure(plugin, { enabled: false });

    expect(Reflect.get(context.api, 'removable')).toBeUndefined();
    expect(() =>
      Reflect.apply(
        Reflect.get(context.update, 'removableWrite') as Function,
        undefined,
        []
      )
    ).toThrow(/not callable|not installed/i);
    expect(writes).toEqual(['removable:one']);
  });

  it('keeps root and keyed API projection scoped to its owning plugin', () => {
    const FirstPlugin = createBasePlugin({ key: 'firstApi' })
      .extendEditorApi(() => ({
        firstNested: { read: () => 'first-nested' },
        firstRoot: () => 'first-root',
      }))
      .extendApi(() => ({ firstOwn: () => 'first-own' }));
    const SecondPlugin = createBasePlugin({ key: 'secondApi' })
      .extendEditorApi(() => ({ secondRoot: () => 'second-root' }))
      .extendApi(() => ({ secondOwn: () => 'second-own' }));
    const editor = createBaseEditor({
      plugins: [FirstPlugin, SecondPlugin],
    });
    const first = editor.plugin(FirstPlugin);
    const second = editor.plugin(SecondPlugin);

    expect(first.api.firstRoot()).toBe('first-root');
    expect(first.api.firstOwn()).toBe('first-own');
    expect(first.api.firstNested.read()).toBe('first-nested');
    expect(Object.isFrozen(first.api.firstNested)).toBe(true);
    expect(() =>
      Object.defineProperty(first.api.firstNested, 'read', {
        value: () => 'mutated',
      })
    ).toThrow();
    expect(Reflect.get(first.api, 'secondRoot')).toBeUndefined();
    expect(Reflect.get(first.api, 'secondOwn')).toBeUndefined();
    expect(second.api.secondRoot()).toBe('second-root');
    expect(second.api.secondOwn()).toBe('second-own');
    expect(Reflect.get(second.api, 'firstRoot')).toBeUndefined();
    expect(Reflect.get(second.api, 'firstOwn')).toBeUndefined();
  });

  it('projects compiled plugin API into transaction extension factories', () => {
    const writes: string[] = [];
    const Plugin = createBasePlugin({ key: 'txCandidateApi' })
      .extendApi(() => ({ current: () => 'compiled' }))
      .extendTx(({ api }) => () => ({
        write: () => {
          writes.push(api.current());
        },
      }));
    const editor = createBaseEditor({ plugins: [Plugin] });

    editor.plugin(Plugin).update.write();

    expect(writes).toEqual(['compiled']);
  });

  it('keeps runtime closures created during resolution on the live options store', () => {
    const Plugin = createBasePlugin({
      key: 'liveRuntimeClosure',
      options: { enabled: false },
    }).extend(({ getOptions }) => ({
      shortcuts: {
        run: {
          handler: () => getOptions().enabled,
          keys: 'mod+k',
        },
      },
    }));
    const editor = createBaseEditor({ plugins: [Plugin] });
    const run = () =>
      editor.runtime.shortcuts['liveRuntimeClosure.run']?.handler?.(
        {} as never
      );

    expect(run()).toBe(false);

    editor.plugin(Plugin).setOption('enabled', true);

    expect(run()).toBe(true);
  });

  it('resolves dependent runtime factories against the same candidate plugin revision', () => {
    const TargetPlugin = createBasePlugin({
      config: { label: 'one' },
      key: 'candidateTarget',
    }).extend(({ plugin }) => ({
      options: { resolvedLabel: `resolved-${plugin.config.label}` },
    }));
    const ConsumerPlugin = createBasePlugin({
      dependencies: [TargetPlugin],
      key: 'candidateConsumer',
    }).extend(({ editor }) => ({
      options: {
        targetLabel: editor.getPlugin(TargetPlugin).config.label,
        targetResolvedLabel:
          editor.getPlugin(TargetPlugin).options.resolvedLabel,
      },
    }));
    const editor = createBaseEditor({
      plugins: [ConsumerPlugin],
    });
    const consumer = editor.plugin(ConsumerPlugin);

    expect(consumer.getOptions().targetLabel).toBe('one');
    expect(consumer.getOptions().targetResolvedLabel).toBe('resolved-one');

    editor.configure(TargetPlugin, { label: 'two' });

    expect(editor.getPlugin(TargetPlugin).config.label).toBe('two');
    expect(editor.getPlugin(TargetPlugin).options.resolvedLabel).toBe(
      'resolved-two'
    );
    expect(consumer.getOptions().targetLabel).toBe('two');
    expect(consumer.getOptions().targetResolvedLabel).toBe('resolved-two');
  });

  it('publishes plugin topology derived from the candidate configuration', () => {
    const DependencyPlugin = createBasePlugin({
      key: 'configuredChildDependency',
    }).extendApi(() => ({ value: () => 'dependency' }));
    const ChildPlugin = createBasePlugin({
      dependencies: [DependencyPlugin],
      key: 'configuredChild',
      options: { value: 'child' },
    }).extendApi(({ getOptions }) => ({
      value: () => getOptions().value,
    }));
    const ParentPlugin = createBasePlugin({
      config: { child: false },
      key: 'configuredParent',
    }).extend(({ plugin }) => ({
      plugins: plugin.config.child ? [ChildPlugin] : [],
    }));
    const editor = createBaseEditor({
      plugins: [ParentPlugin],
    });

    expect(editor.plugins.configuredChild).toBeUndefined();

    editor.configure(ParentPlugin, { child: true });

    const child = editor.plugin(ChildPlugin);

    expect(child.api.value()).toBe('child');
    expect(editor.plugin(DependencyPlugin).api.value()).toBe('dependency');

    editor.configure(ParentPlugin, { child: false });

    expect(editor.plugins.configuredChild).toBeUndefined();
    expect(editor.plugins.configuredChildDependency).toBeUndefined();
    expect(() => editor.getPlugin(ChildPlugin)).toThrow(/not installed/i);
    expect(() => child.api.value()).toThrow(/not installed/i);

    editor.configure(ParentPlugin, { child: true });

    expect(child.api.value()).toBe('child');
  });

  it('resolves API factories against the candidate model without poisoning parser rollback', () => {
    type ModelMode = 'element' | 'invalid' | 'mark';
    const modelConfig: { mode: ModelMode } = { mode: 'element' };
    const ModelPlugin = createBasePlugin({
      config: modelConfig,
      key: 'candidateModel',
      schema: ({ config }) =>
        config.mode === 'mark'
          ? {
              mark: property.boolean({
                default: false,
                omitDefault: true,
              }),
            }
          : {
              element: {
                content: schema.content.type(
                  config.mode === 'invalid' ? 'missing-child' : 'p',
                  {
                    default: {
                      type: config.mode === 'invalid' ? 'missing-child' : 'p',
                    },
                    min: 1,
                  }
                ),
              },
            },
    }).extendApi(({ editor, plugin }) => {
      const entry = prepareParserRegistry(editor).plugins.find(
        (candidate) => candidate.key === plugin.key
      );
      const directMode = editor.plugins[plugin.key]?.config.mode;
      const kind = entry?.isElement
        ? 'element'
        : entry?.isLeaf
          ? 'mark'
          : 'none';

      return {
        observedDirectMode: () => directMode,
        observedKind: () => kind,
      };
    });
    const editor = createBaseEditor({
      plugins: [ModelPlugin],
    });
    const context = editor.plugin(ModelPlugin);

    expect(context.api.observedDirectMode()).toBe('element');
    expect(context.api.observedKind()).toBe('element');

    editor.configure(ModelPlugin, { mode: 'mark' });

    expect(context.api.observedDirectMode()).toBe('mark');
    expect(context.api.observedKind()).toBe('mark');

    const parserRegistry = prepareParserRegistry(editor);

    expect(
      parserRegistry.plugins.find(({ key }) => key === ModelPlugin.key)?.isLeaf
    ).toBe(true);
    expect(() => editor.configure(ModelPlugin, { mode: 'invalid' })).toThrow();
    expect(prepareParserRegistry(editor)).toBe(parserRegistry);
    expect(context.api.observedDirectMode()).toBe('mark');
    expect(context.api.observedKind()).toBe('mark');
  });

  it('publishes config-derived options and selectors through one stable subscribed store', () => {
    const { plugin } = createRevisionFixture();
    const editor = createBaseEditor({ plugins: [plugin] });
    const store = editor.getOptionsStore(plugin);
    const notifications: [unknown, unknown][] = [];
    const unsubscribe = store.subscribe(
      'configuredLabel',
      (value, previous) => {
        notifications.push([value, previous]);
      }
    );

    expect(store.get('configuredLabel')).toBe('one:one');

    editor.configure(plugin, { label: 'two' });

    expect(editor.getOptionsStore(plugin)).toBe(store);
    expect(store.get('state')).toEqual({ label: 'two' });
    expect(store.get('configuredLabel')).toBe('two:two');
    expect(store.get('eagerConfiguredLabel')).toBe('two:two');
    expect(notifications).toEqual([['two:two', 'one:one']]);

    expect(() =>
      editor.configure(plugin, {
        childType: 'missing-child',
        label: 'three',
      })
    ).toThrow();

    expect(editor.getOptionsStore(plugin)).toBe(store);
    expect(store.get('state')).toEqual({ label: 'two' });
    expect(store.get('configuredLabel')).toBe('two:two');
    expect(store.get('eagerConfiguredLabel')).toBe('two:two');
    expect(notifications).toEqual([['two:two', 'one:one']]);

    unsubscribe();
  });

  it('rejects mutation of the published plugin projection', () => {
    const { plugin } = createRevisionFixture();
    const editor = createBaseEditor({ plugins: [plugin] });
    const publishedPlugin = editor.getPlugin(plugin);

    expect(Object.isFrozen(publishedPlugin)).toBe(true);
    expect(() =>
      Object.defineProperty(publishedPlugin, 'type', {
        value: 'mutated',
      })
    ).toThrow();
    expect(editor.getType(plugin.key)).toBe('revisioned');
  });

  it('deep-freezes published shortcut and input-rule indexes', () => {
    const Plugin = createBasePlugin({ key: 'frozenRuntimeIndexes' }).configure({
      inputRules: [
        {
          apply: () => true,
          target: 'insertText',
          trigger: '*',
        },
      ],
      shortcuts: {
        current: { keys: 'mod+k' },
      },
    });
    const editor = createBaseEditor({ plugins: [Plugin] });
    const { inputRules, shortcuts } = getPlateModelPublication(editor)!;
    const shortcut = shortcuts['frozenRuntimeIndexes.current'];
    const pluginRules = inputRules.plugins.frozenRuntimeIndexes;
    const [rule] = pluginRules.rules;

    expect(Object.isFrozen(shortcuts)).toBe(true);
    expect(Object.isFrozen(shortcut)).toBe(true);
    expect(Object.isFrozen(inputRules)).toBe(true);
    expect(Object.isFrozen(inputRules.insertBreak)).toBe(true);
    expect(Object.isFrozen(inputRules.insertData)).toBe(true);
    expect(Object.isFrozen(inputRules.insertText)).toBe(true);
    expect(Object.isFrozen(inputRules.insertText.all)).toBe(true);
    expect(Object.isFrozen(inputRules.insertText.byTrigger)).toBe(true);
    expect(Object.isFrozen(inputRules.insertText.byTrigger['*'])).toBe(true);
    expect(Object.isFrozen(inputRules.plugins)).toBe(true);
    expect(Object.isFrozen(pluginRules)).toBe(true);
    expect(Object.isFrozen(pluginRules.rules)).toBe(true);
    expect(Object.isFrozen(rule)).toBe(true);
    expect(() =>
      Object.defineProperty(rule, 'priority', { value: -1 })
    ).toThrow();
  });

  it('deep-freezes published component and plugin-cache indexes', () => {
    const editor = createBaseEditor({
      plugins: [createBasePlugin({ key: 'frozenModelIndexes' })],
    });
    const { components, pluginCache } = getPlateModelPublication(editor)!;

    expect(Object.isFrozen(components)).toBe(true);
    expect(Object.isFrozen(pluginCache)).toBe(true);
    expect(Object.isFrozen(pluginCache.decorate)).toBe(true);
    expect(Object.isFrozen(pluginCache.handlers)).toBe(true);
    expect(Object.isFrozen(pluginCache.handlers.onChange)).toBe(true);
    expect(Object.isFrozen(pluginCache.inject)).toBe(true);
    expect(Object.isFrozen(pluginCache.inject.nodeProps)).toBe(true);
    expect(Object.isFrozen(pluginCache.node)).toBe(true);
    expect(Object.isFrozen(pluginCache.node.types)).toBe(true);
    expect(Object.isFrozen(pluginCache.render)).toBe(true);
    expect(Object.isFrozen(pluginCache.render.aboveEditable)).toBe(true);
    expect(Object.isFrozen(pluginCache.rules)).toBe(true);
    expect(Object.isFrozen(pluginCache.rules.match)).toBe(true);
    expect(Object.isFrozen(pluginCache.transformInitialValue)).toBe(true);
    expect(Object.isFrozen(pluginCache.useHooks)).toBe(true);
    expect(() =>
      Object.defineProperty(pluginCache.node.types, 'mutated', {
        value: 'mutated',
      })
    ).toThrow();
  });

  it('never falls through an active candidate to stale or foreign publication state', () => {
    const { plugin } = createRevisionFixture();
    const firstEditor = createBaseEditor({
      plugins: [plugin],
    });
    const secondEditor = createBaseEditor({
      plugins: [plugin],
    });
    const firstPublished = firstEditor.getPlugin(plugin);
    const secondPublished = secondEditor.getPlugin(plugin);

    withCompiledPlatePluginCandidate(secondEditor, [secondPublished], () => {
      expect(secondEditor.plugin(firstPublished).plugin).toBe(secondPublished);
    });
    withCompiledPlatePluginCandidate(secondEditor, [], () => {
      expect(() => secondEditor.getPlugin(plugin)).toThrow(/not installed/i);
    });
    withCompiledPlatePluginApiCandidate(secondEditor, {}, () => {
      expect(
        Reflect.get(secondEditor.plugin(plugin).api, 'current')
      ).toBeUndefined();
    });
  });

  it('replaces only child lifecycle resources owned by the configured plugin', () => {
    const lifecycle = {
      changedActivate: 0,
      changedCleanup: 0,
      stableActivate: 0,
      stableCleanup: 0,
    };
    const StablePlugin = createBasePlugin({
      key: 'stableLifecycleResource',
    }).extendExtension({
      activate(_editor, context) {
        lifecycle.stableActivate++;
        context.onCleanup(() => {
          lifecycle.stableCleanup++;
        });
      },
    });
    const ChangedPlugin = createBasePlugin({
      config: { revision: 1 },
      key: 'changedLifecycleResource',
    }).extendExtension(({ plugin }) => ({
      activate(_editor, context) {
        lifecycle.changedActivate += plugin.config.revision;
        context.onCleanup(() => {
          lifecycle.changedCleanup++;
        });
      },
    }));
    const editor = createBaseEditor({
      plugins: [StablePlugin, ChangedPlugin],
    });

    expect(lifecycle).toEqual({
      changedActivate: 1,
      changedCleanup: 0,
      stableActivate: 1,
      stableCleanup: 0,
    });

    editor.configure(ChangedPlugin, { revision: 2 });

    expect(lifecycle).toEqual({
      changedActivate: 3,
      changedCleanup: 1,
      stableActivate: 1,
      stableCleanup: 0,
    });
  });

  it('cleans up a removed child lifecycle resource exactly once', () => {
    const lifecycle = { activate: 0, cleanup: 0 };
    const ChildPlugin = createBasePlugin({
      key: 'removableLifecycleChild',
    }).extendExtension({
      activate(_editor, context) {
        lifecycle.activate++;
        context.onCleanup(() => {
          lifecycle.cleanup++;
        });
      },
    });
    const ParentPlugin = createBasePlugin({
      config: { child: true },
      key: 'removableLifecycleParent',
    }).extend(({ plugin }) => ({
      plugins: plugin.config.child ? [ChildPlugin] : [],
    }));
    const editor = createBaseEditor({
      plugins: [ParentPlugin],
    });

    expect(lifecycle).toEqual({ activate: 1, cleanup: 0 });

    editor.configure(ParentPlugin, { child: false });

    expect(lifecycle).toEqual({ activate: 1, cleanup: 1 });
  });

  it('keeps every published child resource active when a model candidate fails', () => {
    const lifecycle = { activate: 0, cleanup: 0 };
    const Plugin = createBasePlugin({
      config: { childType: 'p' },
      key: 'rollbackLifecycleResource',
      schema: ({ config }) => ({
        element: {
          content: schema.content.type(config.childType, {
            default: { type: config.childType },
            min: 1,
          }),
        },
      }),
    }).extendExtension({
      activate(_editor, context) {
        lifecycle.activate++;
        context.onCleanup(() => {
          lifecycle.cleanup++;
        });
      },
    });
    const editor = createBaseEditor({
      plugins: [Plugin],
    });
    const publication = getPlateModelPublication(editor);

    expect(() =>
      editor.configure(Plugin, { childType: 'missing-child' })
    ).toThrow();

    expect(getPlateModelPublication(editor)).toBe(publication);
    expect(lifecycle).toEqual({ activate: 1, cleanup: 0 });
  });
});
