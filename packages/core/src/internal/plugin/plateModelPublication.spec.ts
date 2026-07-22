import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import {
  getPlateModelPublication,
  withCompiledPlatePluginApiCandidate,
  withCompiledPlatePluginCandidate,
} from './compilePlateModel';

describe('Plate model publication', () => {
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
    // @ts-expect-error root editor APIs do not leak into plugin portals
    expect(second.api.secondRoot).toBeUndefined();
    expect(editor.api.firstRoot()).toBe('first-root');
    expect(editor.api.secondRoot()).toBe('second-root');
    expect(Reflect.get(editor.api, 'firstApi')).toBeUndefined();
    expect(Reflect.get(editor.api, 'secondApi')).toBeUndefined();
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
      editor.runtime.shortcuts['liveRuntimeClosure.run']?.handler?.(
        {} as never
      );

    expect(run()).toBe(false);

    editor.plugin(Plugin).setOption('enabled', true);

    expect(run()).toBe(true);
  });

  it('publishes configured options before contextual descriptor layers', () => {
    const Plugin = createBasePlugin({
      key: 'contextualOptions',
      options: { label: 'one', projection: '' },
      targetPluginKeys: ['firstTarget'],
    })
      .configure({
        options: { label: 'descriptor' },
        targetPluginKeys: ['descriptorTarget'],
      })
      .configure(({ getOptions, plugin }) => ({
        options: {
          projection: `${getOptions().label}:${plugin.targetPluginKeys.join(
            ','
          )}`,
        },
      }));
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
