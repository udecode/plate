import {
  createEditor,
  createEditorView,
  defineCommand,
  defineEditorExtension,
  type EditorRuntime,
  type TransactionSpec,
} from '@platejs/plite';
import {
  dispatchCommand,
  getInstalledEditorExtension,
} from '@platejs/plite/internal';

import { createBaseEditor, extendBaseEditor } from '../../lib/editor';
import type { BaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import {
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
  getPlateModelPublication,
  getPlateRuntime,
  setCompiledPlatePluginCandidate,
  withCompiledPlatePluginApiCandidate,
  withCompiledPlatePluginCandidate,
} from './compilePlateModel';
import { getPlateRuntimeCandidate } from './plateRuntime';
import { getPluginStore } from './pluginStore';

describe('Plate model publication', () => {
  it('exposes the compiling plugin set to native API factories', () => {
    let observedRuntime: ReturnType<typeof getPlateRuntime> | undefined;
    let observedPlugin: unknown;
    const ObserverExtension = defineEditorExtension({
      api: ({ editor: runtimeEditor }) => {
        observedRuntime = getPlateRuntime(runtimeEditor);
        observedPlugin = getCompiledPlatePlugin(
          runtimeEditor as unknown as BaseEditor<any, any>,
          'publishedBeforeExtensions'
        );

        return {};
      },
      name: 'publishedBeforeExtensions',
    });
    const Plugin = createBasePlugin({
      name: 'publishedBeforeExtensions',
      shortcuts: {
        run: { handler: () => {}, keys: 'mod+k' },
      },
    }).extend(ObserverExtension);
    const editor = createBaseEditor({ plugins: [Plugin] });

    expect(observedRuntime?.pluginList.length).toBeGreaterThan(0);
    expect(observedPlugin).toMatchObject({
      name: 'publishedBeforeExtensions',
    });
    expect(
      getPlateRuntime(editor).pluginList.find(
        (plugin) => plugin.name === 'publishedBeforeExtensions'
      )
    ).toBe(editor.plugin(Plugin).plugin);
  });

  it('clears private construction state when an extension throws', () => {
    const editor = createEditor();
    const BrokenPlugin = createBasePlugin({
      name: 'brokenExtension',
    }).extend(() => {
      throw new Error('broken extension');
    });

    expect(() =>
      extendBaseEditor(editor, {
        plugins: [BrokenPlugin],
        skipInitialization: true,
      })
    ).toThrow('broken extension');
    expect(getPlateModelPublication(editor)).toBeUndefined();
    expect(getPlateRuntimeCandidate(editor)).toBeUndefined();
    expect(getPluginStore(editor, BrokenPlugin.name)).toBeUndefined();
  });

  it('rolls back failed initialization and retries on the same raw editor', () => {
    let correctionRuns = 0;
    let shouldThrow = true;
    const Correction = defineEditorExtension({
      corrections: [
        {
          correct() {
            correctionRuns++;
            if (shouldThrow) throw new Error('bootstrap correction failed');
          },
          event: 'content',
        },
      ],
      name: 'retryableBootstrap',
    });
    const Plugin = createBasePlugin({
      name: 'retryableBootstrap',
    }).extend(Correction);
    const initialSelection = {
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
      kind: 'text' as const,
    };
    const raw = createEditor({
      initialSelection,
      initialValue: [{ children: [{ text: 'before' }], type: 'p' }],
    });
    const previousSchema = raw.read.schema;
    const previousIdentity = previousSchema.identity();
    const previousValue = raw.read.value();
    const previousVersion = raw.read.runtime.snapshot().version;

    expect(() =>
      extendBaseEditor(raw, {
        initialValue: [{ children: [{ text: 'after' }], type: 'p' }],
        plugins: [Plugin],
        shouldNormalizeEditor: true,
      })
    ).toThrow('bootstrap correction failed');
    expect(correctionRuns).toBeGreaterThan(0);
    expect(raw.read.value()).toEqual(previousValue);
    expect(raw.read.selection()).toEqual(initialSelection);
    expect(raw.read.lastCommit()).toBeNull();
    expect(raw.read.runtime.snapshot().version).toBe(previousVersion);
    expect(raw.read.schema).toBe(previousSchema);
    expect(raw.read.schema.identity()).toBe(previousIdentity);
    expect(getPlateModelPublication(raw)).toBeUndefined();
    expect(getPlateRuntimeCandidate(raw)).toBeUndefined();
    expect(getPluginStore(raw, Plugin.name)).toBeUndefined();
    expect(
      getInstalledEditorExtension(raw, 'throwing-bootstrap-correction')
    ).toBeUndefined();

    shouldThrow = false;
    const editor = extendBaseEditor(raw, {
      initialValue: [{ children: [{ text: 'after' }], type: 'p' }],
      plugins: [Plugin],
      shouldNormalizeEditor: true,
    });

    expect(editor).toBe(raw);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'after' }], type: 'p' },
    ]);
    expect(editor.read.lastCommit()).toBeNull();
    expect(getPlateModelPublication(editor)).toBeDefined();
    expect(
      getInstalledEditorExtension(editor, 'retryableBootstrap')
    ).toBeDefined();
  });

  it('invalidates specs minted before a supplied raw editor is bootstrapped', () => {
    let spec!: TransactionSpec;
    const applyPreBootstrapSpec = defineCommand(
      'plate.apply-pre-bootstrap-spec',
      { build: () => spec }
    );
    const raw = createEditor({
      initialValue: [{ children: [{ text: 'a' }], type: 'p' }],
    });
    const previousVersion = raw.read.runtime.snapshot().version;

    spec = raw.read((state) =>
      state.transaction((tx) => {
        tx.text.insert('x', { at: { offset: 1, path: [0, 0] } });
      })
    );

    const editor = createBaseEditor({ editor: raw });

    expect(editor.read.runtime.snapshot().version).toBe(previousVersion);
    expect(editor.read.lastCommit()).toBeNull();
    expect(() => dispatchCommand(editor, applyPreBootstrapSpec)).toThrow(
      'Cannot apply a stale transaction spec.'
    );
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'a' }], type: 'p' },
    ]);
  });

  it('publishes canonical dependency identities per editor', () => {
    const Dependency = createBasePlugin({
      name: 'canonicalDependency',
      initialState: { n: 1 },
    });
    const Child = createBasePlugin({
      name: 'canonicalChild',
      initialState: { n: 1 },
    });
    const Parent = createBasePlugin({
      dependencies: [Dependency, Child],
      name: 'canonicalParent',
    });
    const createConfiguredEditor = (dependencyN: number, childN: number) =>
      createBaseEditor({
        plugins: [
          Parent,
          Dependency.configure({ initialState: { n: dependencyN } }),
          Child.configure({ initialState: { n: childN } }),
        ],
      });
    const first = createConfiguredEditor(2, 3);
    const second = createConfiguredEditor(4, 5);
    const firstParent = first.plugin(Parent).plugin;
    const firstDependency = first.plugin(Dependency).plugin;
    const firstChild = first.plugin(Child).plugin;
    const secondParent = second.plugin(Parent).plugin;
    const secondDependency = second.plugin(Dependency).plugin;
    const secondChild = second.plugin(Child).plugin;

    expect(firstParent.dependencies[0]).toBe(firstDependency);
    expect(firstParent.dependencies[1]).toBe(firstChild);
    expect(firstDependency.initialState.n).toBe(2);
    expect(firstChild.initialState.n).toBe(3);
    expect(secondParent.dependencies[0]).toBe(secondDependency);
    expect(secondParent.dependencies[1]).toBe(secondChild);
    expect(secondDependency.initialState.n).toBe(4);
    expect(secondChild.initialState.n).toBe(5);
    expect(firstDependency).not.toBe(secondDependency);
    expect(firstChild).not.toBe(secondChild);
  });

  it('shares one Plate publication and plugin store across root views', () => {
    const Plugin = createBasePlugin({
      name: 'rootViewOwner',
      initialState: { enabled: true },
    });
    const editor = createBaseEditor({ plugins: [Plugin] });
    const runtime = Object.freeze({
      api: editor.api,
      anchor: editor.anchor,
      editor,
      extend: editor.extend,
      read: editor.read,
      subscribe: editor.subscribe,
      subscribeCommit: editor.subscribeCommit,
      update: editor.update,
    }) as unknown as EditorRuntime;
    const view = createEditorView(runtime) as unknown as BaseEditor;
    const other = createBaseEditor({ plugins: [Plugin] });

    expect(view).not.toBe(editor);
    expect(getPlateModelPublication(view)).toBe(
      getPlateModelPublication(editor)
    );
    expect(getPlateRuntime(view)).toBe(getPlateRuntime(editor));
    expect(getCompiledPlatePlugin(view, Plugin.name)).toBe(
      editor.plugin(Plugin).plugin
    );
    expect(getPluginStore(view, Plugin.name)).toBe(
      getPluginStore(editor, Plugin.name)
    );
    expect(getPlateModelPublication(view)).not.toBe(
      getPlateModelPublication(other)
    );
    expect(getPluginStore(view, Plugin.name)).not.toBe(
      getPluginStore(other, Plugin.name)
    );
  });

  it('keeps private compiled registries safe for reserved property names', () => {
    const Plugin = createBasePlugin({
      name: 'toString',
      inputRules: ({ rule }) => [
        rule.insertText({
          apply: () => true,
          target: 'insertText',
          trigger: 'constructor',
        }),
      ],
    });
    const editor = createBaseEditor({ plugins: [Plugin] });
    const runtime = getPlateRuntime(editor);
    const rawEditor = createEditor() as unknown as BaseEditor<any, any>;

    expect(Reflect.get(runtime.plugins, 'toString')).toBe(
      editor.plugin(Plugin).plugin
    );
    expect(Reflect.get(runtime.plugins, 'constructor')).toBeUndefined();
    expect(Reflect.get(runtime.components, 'toString')).toBeUndefined();
    expect(
      Reflect.get(runtime.inputRules.plugins, 'toString').rules
    ).toHaveLength(1);
    expect(
      Reflect.get(runtime.inputRules.insertText.byTrigger, 'constructor')
    ).toHaveLength(1);
    expect(
      getCompiledPlateModelBinding(rawEditor, {
        name: 'constructor',
        type: 'constructor',
      } as never)
    ).toBeUndefined();

    withCompiledPlatePluginCandidate(rawEditor, [], () => {
      setCompiledPlatePluginCandidate(rawEditor, Plugin);

      expect(getCompiledPlatePlugin(rawEditor, 'constructor')).toBeUndefined();
      expect(getCompiledPlatePlugin(rawEditor, 'toString')).toBe(Plugin);
    });
  });

  it('snapshots schema identity instead of retaining mutable caller input', () => {
    const identity = {
      id: 'plate-test:core:internal-plugin-identity-snapshot',
      version: 1,
    };
    const editor = createBaseEditor({ schemaIdentity: identity });

    identity.id = 'mutated';
    identity.version = 2;

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

  it('keeps root and keyed API projection scoped to its owning plugin', () => {
    const FirstPlugin = createBasePlugin({
      api: () => ({
        firstNested: { read: () => 'first-nested' },
        firstOwn: () => 'first-own',
        firstRoot: () => 'first-root',
      }),
      name: 'firstApi',
    });
    const SecondPlugin = createBasePlugin({
      api: () => ({
        secondOwn: () => 'second-own',
        secondRoot: () => 'second-root',
      }),
      name: 'secondApi',
    });
    const editor = createBaseEditor({
      plugins: [FirstPlugin, SecondPlugin],
    });
    const first = editor.plugin(FirstPlugin);
    const second = editor.plugin(SecondPlugin);

    expect(first.api.firstOwn()).toBe('first-own');
    expect(editor.api.firstApi.firstOwn()).toBe('first-own');
    expect(first.api).toBe(editor.api.firstApi);
    expect(Object.isFrozen(first.api)).toBe(true);
    expect(first.api.firstRoot()).toBe('first-root');
    expect(editor.api.firstApi.firstNested.read()).toBe('first-nested');
    expect(Object.isFrozen(editor.api.firstApi.firstNested)).toBe(true);
    expect(() =>
      Object.defineProperty(editor.api.firstApi.firstNested, 'read', {
        value: () => 'mutated',
      })
    ).toThrow();
    expect(Reflect.get(first.api, 'secondRoot')).toBeUndefined();
    expect(Reflect.get(first.api, 'secondOwn')).toBeUndefined();
    expect(second.api.secondOwn()).toBe('second-own');
    expect(editor.api.secondApi.secondOwn()).toBe('second-own');
    expect(second.api).toBe(editor.api.secondApi);
    expect(second.api.secondRoot()).toBe('second-root');
    expect(Reflect.get(editor.api, 'firstRoot')).toBeUndefined();
    expect(Reflect.get(editor.api, 'secondRoot')).toBeUndefined();
    expect(Reflect.get(second.api, 'firstRoot')).toBeUndefined();
    expect(Reflect.get(second.api, 'firstOwn')).toBeUndefined();
  });

  it('projects compiled plugin API into transaction extension factories', () => {
    const writes: string[] = [];
    const Plugin = createBasePlugin({
      api: () => ({ current: () => 'compiled' }),
      name: 'txCandidateApi',
    }).extend(({ api }) => ({
      update: () => ({
        write: () => {
          writes.push(api.current());
        },
      }),
    }));
    const editor = createBaseEditor({ plugins: [Plugin] });

    editor.plugin(Plugin).update.write();

    expect(writes).toEqual(['compiled']);
  });

  it('keeps runtime closures on the live plugin store', () => {
    const Plugin = createBasePlugin({
      name: 'liveRuntimeClosure',
      initialState: { enabled: false },
    }).extend(({ store }) => ({
      shortcuts: {
        run: {
          handler: () => store.get().enabled,
          keys: 'mod+k',
        },
      },
    }));
    const editor = createBaseEditor({ plugins: [Plugin] });
    const run = () =>
      getPlateRuntime(editor).shortcuts['liveRuntimeClosure.run']?.handler?.(
        {} as never
      );

    expect(run()).toBe(false);

    editor.plugin(Plugin).store.set({ enabled: true });

    expect(run()).toBe(true);
  });

  it('publishes configured initialState before contextual extensions', () => {
    const Plugin = createBasePlugin({
      name: 'contextualState',
      initialState: { label: 'one', projection: '' },
      targetPluginNames: ['descriptorTarget'],
    })
      .extend(({ store, plugin }) => ({
        initialState: {
          projection: `${store.get().label}:${plugin.targetPluginNames.join(
            ','
          )}`,
        },
      }))
      .configure({
        initialState: { label: 'descriptor' },
      });
    const editor = createBaseEditor({ plugins: [Plugin] });

    expect(editor.plugin(Plugin).store.get('projection')).toBe(
      'descriptor:descriptorTarget'
    );
  });

  it('rejects mutation of the published plugin projection', () => {
    const plugin = createBasePlugin({ name: 'publishedProjection' });
    const editor = createBaseEditor({ plugins: [plugin] });
    const publishedPlugin = editor.plugin(plugin).plugin;

    expect(Object.isFrozen(publishedPlugin)).toBe(true);
    expect(() =>
      Object.defineProperty(publishedPlugin, 'type', {
        value: 'mutated',
      })
    ).toThrow();
    expect(editor.plugin(plugin.name).type).toBe('publishedProjection');
  });

  it('deep-freezes published shortcut and input-rule indexes', () => {
    const Plugin = createBasePlugin({ name: 'frozenRuntimeIndexes' }).configure(
      {
        inputRules: [
          {
            apply: () => true,
            target: 'insertText',
            trigger: '*',
          },
        ],
        shortcuts: {
          current: { handler: () => undefined, keys: 'mod+k' },
        },
      }
    );
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
      plugins: [createBasePlugin({ name: 'frozenModelIndexes' })],
    });
    const { components, pluginCache } = getPlateModelPublication(editor)!;

    expect(Object.isFrozen(components)).toBe(true);
    expect(Object.isFrozen(pluginCache)).toBe(true);
    expect(Object.isFrozen(pluginCache.decorate)).toBe(true);
    expect(Object.isFrozen(pluginCache.on)).toBe(true);
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

  it('never falls through an active candidate to stale publication state', () => {
    const plugin = createBasePlugin({
      name: 'candidateLookup',
      initialState: { label: 'one' },
    }).extend(({ store }) => ({
      api: () => ({ current: () => store.get().label }),
    }));
    const firstEditor = createBaseEditor({ plugins: [plugin] });
    const secondEditor = createBaseEditor({ plugins: [plugin] });
    const firstPublished = getCompiledPlatePlugin(firstEditor, plugin)!;
    const secondPublished = getCompiledPlatePlugin(secondEditor, plugin)!;

    withCompiledPlatePluginCandidate(secondEditor, [secondPublished], () => {
      expect(secondEditor.plugin(firstPublished).plugin).toBe(secondPublished);
    });
    withCompiledPlatePluginCandidate(secondEditor, [], () => {
      expect(() => secondEditor.plugin(plugin).plugin).toThrow(
        /not installed/i
      );
    });
    withCompiledPlatePluginApiCandidate(secondEditor, {}, () => {
      expect(
        Reflect.get(secondEditor.plugin(plugin).api, 'current')
      ).toBeUndefined();
    });
  });
});
