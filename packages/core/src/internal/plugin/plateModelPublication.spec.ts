import {
  createEditor,
  createEditorView,
  defineCommand,
  type EditorRuntime,
  type TransactionSpec,
} from '@platejs/plite';
import {
  dispatchCommand,
  getInstalledEditorExtension,
} from '@platejs/plite/internal';

import { createBaseEditor, extendBaseEditor } from '../../lib/editor';
import type { BaseEditor } from '../../lib/editor';
import { createBasePlugin, type PlateEditorExtension } from '../../lib/plugin';
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
import { getPluginOptionsStore } from './pluginOptionsStore';

describe('Plate model publication', () => {
  it('publishes one final runtime before later extension initializers', () => {
    let observedRuntime: ReturnType<typeof getPlateRuntime> | undefined;
    let observedPlugin: unknown;
    const ObserverExtension: PlateEditorExtension = {
      api: (runtimeEditor) => {
        observedRuntime = getPlateRuntime(runtimeEditor);
        observedPlugin = getCompiledPlatePlugin(
          runtimeEditor as BaseEditor<any, any>,
          'publishedBeforeExtensions'
        );

        return {};
      },
      name: 'published-runtime-observer',
    };
    const Plugin = createBasePlugin({
      key: 'publishedBeforeExtensions',
      shortcuts: {
        run: { handler: () => {}, keys: 'mod+k' },
      },
    }).extendExtension(ObserverExtension);
    const editor = createBaseEditor({ plugins: [Plugin] });

    expect(observedRuntime?.pluginList.length).toBeGreaterThan(0);
    expect(
      Object.keys(observedRuntime?.inputRules.plugins ?? {}).length
    ).toBeGreaterThan(0);
    expect(
      observedRuntime?.shortcuts['publishedBeforeExtensions.run']
    ).toBeDefined();
    expect(observedPlugin).toBe(editor.getPlugin(Plugin));
    expect(
      observedRuntime?.pluginList.find(
        (plugin) => plugin.key === 'publishedBeforeExtensions'
      )
    ).toBe(observedPlugin);
  });

  it('clears private construction state when an extension throws', () => {
    const editor = createEditor();
    const BrokenPlugin = createBasePlugin({
      key: 'brokenExtension',
    }).extendExtension(() => {
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
    expect(getPluginOptionsStore(editor, BrokenPlugin.key)).toBeUndefined();
  });

  it('rolls back failed initialization and retries on the same raw editor', () => {
    let correctionRuns = 0;
    let shouldThrow = true;
    const Correction: PlateEditorExtension = {
      corrections: [
        {
          correct() {
            correctionRuns++;
            if (shouldThrow) throw new Error('bootstrap correction failed');
          },
          event: 'content',
        },
      ],
      name: 'throwing-bootstrap-correction',
    };
    const Plugin = createBasePlugin({
      key: 'retryableBootstrap',
    }).extendExtension(Correction);
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
    expect(getPluginOptionsStore(raw, Plugin.key)).toBeUndefined();
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
      getInstalledEditorExtension(editor, 'throwing-bootstrap-correction')
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
      key: 'canonicalDependency',
      options: { n: 1 },
    });
    const Child = createBasePlugin({
      key: 'canonicalChild',
      options: { n: 1 },
    });
    const Parent = createBasePlugin({
      dependencies: [Dependency, Child],
      key: 'canonicalParent',
    });
    const createConfiguredEditor = (dependencyN: number, childN: number) =>
      createBaseEditor({
        plugins: [
          Parent,
          Dependency.configure({ options: { n: dependencyN } }),
          Child.configure({ options: { n: childN } }),
        ],
      });
    const first = createConfiguredEditor(2, 3);
    const second = createConfiguredEditor(4, 5);
    const firstParent = first.getPlugin(Parent);
    const firstDependency = first.getPlugin(Dependency);
    const firstChild = first.getPlugin(Child);
    const secondParent = second.getPlugin(Parent);
    const secondDependency = second.getPlugin(Dependency);
    const secondChild = second.getPlugin(Child);

    expect(firstParent.dependencies[0]).toBe(firstDependency);
    expect(firstParent.dependencies[1]).toBe(firstChild);
    expect(firstDependency.options.n).toBe(2);
    expect(firstChild.options.n).toBe(3);
    expect(secondParent.dependencies[0]).toBe(secondDependency);
    expect(secondParent.dependencies[1]).toBe(secondChild);
    expect(secondDependency.options.n).toBe(4);
    expect(secondChild.options.n).toBe(5);
    expect(firstDependency).not.toBe(secondDependency);
    expect(firstChild).not.toBe(secondChild);
  });

  it('shares one Plate publication and option store across root views', () => {
    const Plugin = createBasePlugin({
      key: 'rootViewOwner',
      options: { enabled: true },
    });
    const editor = createBaseEditor({ plugins: [Plugin] });
    const runtime = Object.freeze({
      api: editor.api,
      anchor: editor.anchor,
      editor,
      extend: editor.extend,
      getApi: editor.getApi,
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
    expect(getCompiledPlatePlugin(view, Plugin.key)).toBe(
      editor.getPlugin(Plugin)
    );
    expect(getPluginOptionsStore(view, Plugin.key)).toBe(
      getPluginOptionsStore(editor, Plugin.key)
    );
    expect(getPlateModelPublication(view)).not.toBe(
      getPlateModelPublication(other)
    );
    expect(getPluginOptionsStore(view, Plugin.key)).not.toBe(
      getPluginOptionsStore(other, Plugin.key)
    );
  });

  it('keeps private compiled registries safe for reserved property names', () => {
    const Plugin = createBasePlugin({
      inputRules: ({ rule }) => [
        rule.insertText({
          apply: () => true,
          target: 'insertText',
          trigger: 'constructor',
        }),
      ],
      key: 'toString',
    });
    const editor = createBaseEditor({ plugins: [Plugin] });
    const runtime = getPlateRuntime(editor);
    const rawEditor = createEditor() as BaseEditor<any, any>;

    expect(Reflect.get(runtime.plugins, 'toString')).toBe(
      editor.getPlugin(Plugin)
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
        key: 'constructor',
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
    const editor = createBaseEditor({ schema: identity });

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

    expect(first.api.firstOwn()).toBe('first-own');
    expect(editor.api.firstApi.firstOwn()).toBe('first-own');
    expect(first.api).toBe(editor.api.firstApi);
    expect(Object.isFrozen(first.api)).toBe(true);
    // @ts-expect-error root editor APIs do not leak into plugin portals
    expect(first.api.firstRoot).toBeUndefined();
    expect(editor.api.firstNested.read()).toBe('first-nested');
    expect(Object.isFrozen(editor.api.firstNested)).toBe(true);
    expect(() =>
      Object.defineProperty(editor.api.firstNested, 'read', {
        value: () => 'mutated',
      })
    ).toThrow();
    expect(Reflect.get(first.api, 'secondRoot')).toBeUndefined();
    expect(Reflect.get(first.api, 'secondOwn')).toBeUndefined();
    expect(second.api.secondOwn()).toBe('second-own');
    expect(editor.api.secondApi.secondOwn()).toBe('second-own');
    expect(second.api).toBe(editor.api.secondApi);
    // @ts-expect-error root editor APIs do not leak into plugin portals
    expect(second.api.secondRoot).toBeUndefined();
    expect(editor.api.firstRoot()).toBe('first-root');
    expect(editor.api.secondRoot()).toBe('second-root');
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

  it('keeps runtime closures on the live options store', () => {
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
      getPlateRuntime(editor).shortcuts['liveRuntimeClosure.run']?.handler?.(
        {} as never
      );

    expect(run()).toBe(false);

    editor.plugin(Plugin).setOption('enabled', true);

    expect(run()).toBe(true);
  });

  it('publishes configured options before contextual extensions', () => {
    const Plugin = createBasePlugin({
      key: 'contextualOptions',
      options: { label: 'one', projection: '' },
      targetPluginKeys: ['firstTarget'],
    })
      .extend(({ getOptions, plugin }) => ({
        options: {
          projection: `${getOptions().label}:${plugin.targetPluginKeys.join(
            ','
          )}`,
        },
      }))
      .configure({
        options: { label: 'descriptor' },
        targetPluginKeys: ['descriptorTarget'],
      });
    const editor = createBaseEditor({ plugins: [Plugin] });

    expect(editor.plugin(Plugin).getOption('projection')).toBe(
      'descriptor:descriptorTarget'
    );
  });

  it('rejects mutation of the published plugin projection', () => {
    const plugin = createBasePlugin({ key: 'publishedProjection' });
    const editor = createBaseEditor({ plugins: [plugin] });
    const publishedPlugin = editor.getPlugin(plugin);

    expect(Object.isFrozen(publishedPlugin)).toBe(true);
    expect(() =>
      Object.defineProperty(publishedPlugin, 'type', {
        value: 'mutated',
      })
    ).toThrow();
    expect(editor.getType(plugin.key)).toBe('publishedProjection');
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
        current: { handler: () => undefined, keys: 'mod+k' },
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
      key: 'candidateLookup',
      options: { label: 'one' },
    }).extendApi(({ getOptions }) => ({ current: () => getOptions().label }));
    const firstEditor = createBaseEditor({ plugins: [plugin] });
    const secondEditor = createBaseEditor({ plugins: [plugin] });
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
});
