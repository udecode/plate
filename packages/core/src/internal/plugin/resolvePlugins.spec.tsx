import React from 'react';
import { property, schema } from '@platejs/plite';
import { createBaseEditor, defineEditor } from '../../lib/editor';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';

import { defineBasePlugin } from '../../lib/plugin/defineBasePlugin';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { createPlateEditor } from '../../react/editor/withPlate';
import { definePlatePlugin } from '../../react/plugin/definePlatePlugin';
import { getPlateRuntime } from './compilePlateModel';
import { getPluginStore } from './pluginStore';
import { resolveAndSortPlugins, resolvePlugins } from './resolvePlugins';

const getSortedKeys = (plugins: readonly AnyBasePlugin[]) => {
  const editor = createBaseEditor();

  return resolveAndSortPlugins(editor, plugins).map((plugin) => plugin.name);
};

describe('resolvePlugins', () => {
  it('compiles input-rule declarations once into the published runtime', () => {
    let calls = 0;
    const Plugin = defineBasePlugin('singleInputRuleCompilation', {
      inputRules: () => {
        calls++;

        return [];
      },
    });

    createBaseEditor({ plugins: [Plugin] });

    expect(calls).toBe(1);
  });

  it('initializes independent plugins in application order', () => {
    expect(
      getSortedKeys([
        defineBasePlugin('a', {}),
        defineBasePlugin('b', {}),
        defineBasePlugin('c', {}),
      ])
    ).toEqual(['a', 'b', 'c']);
  });

  it('installs required dependencies', () => {
    const names = getSortedKeys([
      defineBasePlugin('parent', {
        dependencies: [
          defineBasePlugin('dependency1', {}),
          defineBasePlugin('dependency2', {}),
        ],
      }),
    ]);

    expect(names).toContain('parent');
    expect(names).toContain('dependency1');
    expect(names).toContain('dependency2');
  });

  it('exposes required dependency schema identity while author callbacks resolve', () => {
    const Dependency = defineBasePlugin('schemaDependency', {
      schema: () => ({
        element: {
          ...schema.element.textBlock(),
          type: 'persistedSchemaDependency',
        },
      }),
    });
    const Plugin = defineBasePlugin('schemaConsumer', {
      dependencies: [Dependency],
    }).extend(({ editor }) => {
      const dependencyType = editor.plugin(Dependency).schema.type;

      return { api: () => ({ dependencyType: () => dependencyType }) };
    });
    const editor = createBaseEditor({ plugins: [Plugin] });

    expect(editor.plugin(Plugin).api.dependencyType()).toBe(
      'persistedSchemaDependency'
    );
  });

  it('does not include disabled plugins', () => {
    const names = getSortedKeys([
      defineBasePlugin('enabled', {}),
      defineBasePlugin('disabled', { enabled: false }),
    ]);

    expect(names).toContain('enabled');
    expect(names).not.toContain('disabled');
  });

  it('publishes plugin APIs by name and descriptor portal', () => {
    const Plugin1 = defineBasePlugin('plugin1', {
      api: () => ({ methodA: () => 'A' }),
    });
    const Plugin2 = defineBasePlugin('plugin2', {
      api: () => ({ methodB: () => 'B' }),
    });
    const editor = createBaseEditor({
      plugins: [Plugin1, Plugin2],
    });

    expect(editor.api.plugin1.methodA()).toBe('A');
    expect(editor.api.plugin2.methodB()).toBe('B');
    expect(editor.plugin(Plugin1).api.methodA()).toBe('A');
    expect(editor.plugin(Plugin2).api.methodB()).toBe('B');
  });

  it('compiles staged read, update, and editor-extension contributions', () => {
    let extensionCalls = 0;
    const Plugin = defineBasePlugin('unifiedRuntime', {
      initialState: { label: 'unified' },
    })
      .extend(({ store }) => {
        extensionCalls++;

        return {
          api: () => ({
            label: () => store.get().label,
          }),
          read: ({ state }) => ({
            hasSelection: () => state.selection() !== null,
          }),
          selectors: {
            selected: () => false,
          },
        };
      })
      .extend(({ api, read }) => {
        extensionCalls++;
        const hasSelection = read.hasSelection;

        void hasSelection;

        return {
          update: ({ tx }) => ({
            apiLabel: () => api.label(),
            select: () => {
              tx.selection.set({ offset: 0, path: [0, 0] });
            },
          }),
        };
      });
    const editor = createBaseEditor({
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      plugins: [Plugin],
    });

    expect(extensionCalls).toBe(2);
    expect(editor.plugin(Plugin).api.label()).toBe('unified');
    expect(editor.plugin(Plugin).store.get('selected')).toBe(false);
    expect(editor.read.unifiedRuntime.hasSelection()).toBe(false);
    expect(editor.plugin(Plugin).read.hasSelection()).toBe(false);
    expect(editor.update.unifiedRuntime.apiLabel()).toBe('unified');
    const directRead = Reflect.get(
      editor.update.unifiedRuntime,
      'hasSelection'
    );

    expect(() => Reflect.apply(directRead, undefined, [])).toThrow('read-only');
    editor.update.unifiedRuntime.select();
    expect(editor.plugin(Plugin).read.hasSelection()).toBe(true);
  });

  it('registers constructor-authored unified contributions', () => {
    const Plugin = defineBasePlugin('objectUnifiedRuntime', {
      api: () => ({
        label: () => 'object',
      }),
      read: () => ({
        ready: () => true,
      }),
      selectors: {
        selected: () => true,
      },
      update: () => ({
        label: () => 'update',
      }),
    });
    const editor = createBaseEditor({ plugins: [Plugin] });

    expect(editor.plugin(Plugin).api.label()).toBe('object');
    expect(editor.api.objectUnifiedRuntime.label()).toBe('object');
    expect(editor.read.objectUnifiedRuntime.ready()).toBe(true);
    expect(editor.plugin(Plugin).store.get('selected')).toBe(true);
    expect(editor.update.objectUnifiedRuntime.label()).toBe('update');
  });

  it('overwrite API methods with the same name', () => {
    const Plugin = defineBasePlugin('apiOverride', {
      api: () => ({ method: (_: string) => 'first' }),
    }).extend(() => ({
      api: () => ({ method: (_: number) => 'second' }),
    }));
    const editor = createBaseEditor({
      plugins: [Plugin],
    });

    expect(Reflect.apply(editor.api.apiOverride.method, undefined, [1])).toBe(
      'second'
    );
  });

  it('fills plugin cache buckets for node, render, hook, rule, and handler metadata', () => {
    const editor = createBaseEditor({
      plugins: [
        Object.assign(
          definePlatePlugin('cachey', {
            schema: {
              mark: property.boolean({ default: false, omitDefault: true }),
            },
            decorate: () => [],
            on: {
              nodeChange: () => {},
              textChange: () => {},
            },
            transformInitialValue: ({ value }) => value,
            render: {
              isDecoration: false,
              leafProps: { 'data-leaf': 'x' } as any,
              textProps: { 'data-text': 'y' } as any,
              aboveEditable: () => null,
              aboveNodes: () => () => null,
              abovePlite: () => null,
              afterContainer: () => null,
              afterEditable: () => null,
              beforeContainer: () => null,
              beforeEditable: () => null,
              belowNodes: () => () => null,
              belowRootNodes: () => null,
            },
            rules: {
              match: () => true,
            },
          }),
          { useHooks: () => {} }
        ) as any,
      ],
    });

    expect(getPlateRuntime(editor).pluginCache.decorate).toContain('cachey');
    expect(getPlateRuntime(editor).pluginCache.on.nodeChange).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.on.textChange).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.node.textMarks).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.node.leafProps).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.node.textProps).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.transformInitialValue).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.render.aboveEditable).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.render.aboveNodes).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.render.abovePlite).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.render.afterContainer).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.render.afterEditable).toContain(
      'cachey'
    );
    expect(
      getPlateRuntime(editor).pluginCache.render.beforeContainer
    ).toContain('cachey');
    expect(getPlateRuntime(editor).pluginCache.render.beforeEditable).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.render.belowNodes).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.render.belowRootNodes).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.rules.match).toContain('cachey');
    expect(getPlateRuntime(editor).pluginCache.useHooks).toContain('cachey');
  });

  it('creates a shortcut handler from plugin-specific tx commands', () => {
    const toggle = mock();
    const editor = createBaseEditor({
      plugins: [
        defineBasePlugin('shortcutTx', {
          update: () => ({ toggle }),
        }).extend({ shortcuts: { toggle: { keys: 'mod+k' } } }),
      ],
    });

    getPlateRuntime(editor).shortcuts['shortcutTx.toggle']?.handler?.(
      {} as any
    );

    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('routes a keys-only text-block shortcut to its generic toggle', () => {
    const TextBlockPlugin = defineBasePlugin('shortcutTextBlock', {
      schema: { element: schema.element.textBlock() },
    }).extend({
      shortcuts: { toggle: { keys: 'mod+k' } },
    });
    const editor = createBaseEditor({
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
      plugins: [TextBlockPlugin],
    });
    editor.update.selection.set({ offset: 0, path: [0, 0] });

    getPlateRuntime(editor).shortcuts['shortcutTextBlock.toggle']?.handler?.(
      {} as any
    );

    expect(editor.read.children()[0]).toMatchObject({
      type: 'shortcutTextBlock',
    });
  });

  it('does not invent a generic toggle for structural elements', () => {
    const StructuralPlugin = defineBasePlugin('shortcutStructural', {
      schema: { element: { void: 'block' } },
    });
    const editor = createBaseEditor({ plugins: [StructuralPlugin] });

    expect(editor.plugin(StructuralPlugin).update).not.toHaveProperty('toggle');
    expect(() =>
      createBaseEditor({
        plugins: [
          StructuralPlugin.extend({
            shortcuts: { toggle: { keys: 'mod+k' } } as any,
          }),
        ],
      })
    ).toThrow(
      'Plate shortcut "shortcutStructural.toggle" does not match a public update or API command.'
    );
  });

  it('does not invent a generic toggle for text blocks with required construction properties', () => {
    const RequiredPlugin = defineBasePlugin('shortcutRequiredTextBlock', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { tone: property.string({ required: true }) },
        },
      },
    });
    const editor = createBaseEditor({ plugins: [RequiredPlugin] });

    expect(editor.plugin(RequiredPlugin).update).not.toHaveProperty('toggle');
    expect(() =>
      createBaseEditor({
        plugins: [
          RequiredPlugin.extend({
            shortcuts: { toggle: { keys: 'mod+k' } } as any,
          }),
        ],
      })
    ).toThrow(
      'Plate shortcut "shortcutRequiredTextBlock.toggle" does not match a public update or API command.'
    );
  });

  it('does not invent a generic toggle for nested-only text blocks', () => {
    const NestedTextBlockPlugin = defineBasePlugin('nestedTextBlock', {
      schema: {
        element: {
          blockContent: false,
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    });
    const editor = createBaseEditor({ plugins: [NestedTextBlockPlugin] });

    expect(editor.plugin(NestedTextBlockPlugin).update).not.toHaveProperty(
      'toggle'
    );
  });

  it('does not infer the text-block capability from arbitrary text content', () => {
    const TextContentPlugin = defineBasePlugin('shortcutTextContent', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    });
    const editor = createBaseEditor({ plugins: [TextContentPlugin] });

    expect(editor.plugin(TextContentPlugin).update).not.toHaveProperty(
      'toggle'
    );
  });

  it('keeps authored text-block toggle semantics instead of synthesizing the generic command', () => {
    const toggle = mock();
    const Plugin = defineBasePlugin('shortcutAuthoredTextBlock', {
      schema: { element: schema.element.textBlock() },
      shortcuts: { toggle: { keys: 'mod+k' } },
      update: () => ({ toggle }),
    });
    const editor = createBaseEditor({ plugins: [Plugin] });

    getPlateRuntime(editor).shortcuts[
      'shortcutAuthoredTextBlock.toggle'
    ]?.handler?.({} as any);

    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('uses the final application schema when publishing generic toggles', () => {
    const ChildPlugin = defineBasePlugin('overriddenTextBlockChild', {
      schema: { element: schema.element.textBlock() },
    });
    const TextBlockPlugin = defineBasePlugin('overriddenTextBlock', {
      schema: { element: schema.element.textBlock() },
    }).extend({ shortcuts: { toggle: { keys: 'mod+k' } } });
    const definition = defineEditor('overriddenTextBlockEditor', {
      plugins: [ChildPlugin, TextBlockPlugin],
      schema: {
        overrides: [
          schema.override(TextBlockPlugin, {
            element: { content: schema.content.element(ChildPlugin) },
          }),
        ],
      },
    });

    expect(() => createBaseEditor({ plugins: definition.plugins })).toThrow(
      'Plate shortcut "overriddenTextBlock.toggle" does not match a public update or API command.'
    );
  });

  it('creates a shortcut handler from a configured owner update', () => {
    const insert = mock();
    const plugin = defineBasePlugin('shortcutRootTx', {
      update: () => ({ insert }),
    });
    const editor = createBaseEditor({
      plugins: [
        plugin.configure({
          shortcuts: { insert: { keys: 'mod+enter' } },
        }),
      ],
    });

    getPlateRuntime(editor).shortcuts['shortcutRootTx.insert']?.handler?.(
      {} as any
    );

    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('infers plugin-specific api when update has no matching command', () => {
    const other = mock();
    const toggle = mock() as any;
    const editor = createBaseEditor({
      plugins: [
        defineBasePlugin('shortcutMixed', { update: () => ({ other }) })
          .extend(() => ({ api: () => ({ toggle }) }))
          .extend({ shortcuts: { toggle: { keys: 'mod+k' } } }),
      ],
    });

    getPlateRuntime(editor).shortcuts['shortcutMixed.toggle']?.handler?.(
      {} as any
    );

    expect(other).not.toHaveBeenCalled();
    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('rejects shortcuts with no matching update or api command', () => {
    const other = mock();
    const create = () =>
      createBaseEditor({
        plugins: [
          defineBasePlugin('shortcutMissing', {
            update: () => ({ other }),
          }).extend({
            shortcuts: {
              toggle: { keys: 'mod+k' },
            } as any,
          }),
        ],
      });

    expect(create).toThrow(
      'Plate shortcut "shortcutMissing.toggle" does not match a public update or API command.'
    );
    expect(other).not.toHaveBeenCalled();
  });

  it('does not prevent default when a tx shortcut command returns false', () => {
    const untab = mock(() => false);
    const editor = createBaseEditor({
      plugins: [
        defineBasePlugin('shortcutTxFalse', {
          update: () => ({ untab }),
        }).extend({ shortcuts: { untab: { keys: 'shift+tab' } } }),
      ],
    });

    const result = getPlateRuntime(editor).shortcuts[
      'shortcutTxFalse.untab'
    ]?.handler?.({} as any);

    expect(untab).toHaveBeenCalledTimes(1);
    expect(result).toBe(false);
  });

  it('requires target only when update and api commands collide', () => {
    const apiToggle = mock();
    const updateToggle = mock();
    const AmbiguousPlugin = defineBasePlugin('shortcutAmbiguous', {
      api: () => ({ toggle: apiToggle }),
    })
      .extend(() => ({ update: () => ({ toggle: updateToggle }) }))
      .extend({
        shortcuts: { toggle: { keys: 'mod+k' } } as any,
      });

    expect(() => createBaseEditor({ plugins: [AmbiguousPlugin] })).toThrow(
      'Plate shortcut "shortcutAmbiguous.toggle" matches both update and API commands.'
    );

    const ApiPlugin = AmbiguousPlugin.configure({
      shortcuts: { toggle: { keys: 'mod+k', target: 'api' } },
    });
    const apiEditor = createBaseEditor({ plugins: [ApiPlugin] });

    expect(
      getPlateRuntime(apiEditor).shortcuts['shortcutAmbiguous.toggle']
    ).not.toHaveProperty('target');
    getPlateRuntime(apiEditor).shortcuts['shortcutAmbiguous.toggle']?.handler?.(
      {} as any
    );
    expect(apiToggle).toHaveBeenCalledTimes(1);
    expect(updateToggle).not.toHaveBeenCalled();

    const UpdatePlugin = AmbiguousPlugin.configure({
      shortcuts: { toggle: { keys: 'mod+k', target: 'update' } },
    });
    const updateEditor = createBaseEditor({ plugins: [UpdatePlugin] });

    getPlateRuntime(updateEditor).shortcuts[
      'shortcutAmbiguous.toggle'
    ]?.handler?.({} as any);
    expect(updateToggle).toHaveBeenCalledTimes(1);
  });

  it('forbids target together with a custom shortcut handler', () => {
    const create = () =>
      createBaseEditor({
        plugins: [
          defineBasePlugin('shortcutHandlerTarget', {
            shortcuts: {
              invalid: {
                handler: () => true,
                keys: 'mod+k',
                target: 'api',
              } as any,
            },
          }),
        ],
      });

    expect(create).toThrow(
      'Plate shortcut "shortcutHandlerTarget.invalid" cannot define `target` together with a custom handler.'
    );
  });

  it('creates a shortcut handler from plugin-specific api methods', () => {
    const toggle = mock();
    const editor = createBaseEditor({
      plugins: [
        defineBasePlugin('shortcutApi', {
          api: () => ({ toggle }),
        }).extend({
          shortcuts: { toggle: { keys: 'mod+k' } },
        }),
      ],
    });

    getPlateRuntime(editor).shortcuts['shortcutApi.toggle']?.handler?.(
      {} as any
    );

    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('rejects plugin-set mutation after atomic model publication', () => {
    const PluginApi = defineBasePlugin('pluginApi', {
      api: () => ({
        run: () => 'run',
      }),
    });
    const editor = createBaseEditor({
      plugins: [PluginApi],
    });

    expect(editor.plugin(PluginApi).api.run()).toBe('run');
    expect(editor.api.pluginApi.run()).toBe('run');
    expect(editor.plugin(PluginApi).api).toBe(editor.api.pluginApi);

    expect(() => resolvePlugins(editor, [])).toThrow(
      'Plate plugins are fixed after model publication. Configure plugin `initialState` before creating the editor.'
    );
    expect(editor.plugin(PluginApi).api.run()).toBe('run');
  });

  it('throws when inputRules is configured as a boolean map', () => {
    expect(() =>
      createBaseEditor({
        plugins: [
          defineBasePlugin('marks', {}).configure({
            inputRules: { markdown: true } as any,
          }),
        ],
      })
    ).toThrow(
      'inputRules must be an array of explicit rule instances or a factory.'
    );
  });
});

describe('resolveAndSortPlugins', () => {
  it('keeps independent roots in application order', () => {
    expect(
      getSortedKeys([
        defineBasePlugin('a', {}),
        defineBasePlugin('b', {}),
        defineBasePlugin('c', {}),
      ])
    ).toEqual(['a', 'b', 'c']);
  });

  it('installs direct and transitive dependencies once', () => {
    const c = defineBasePlugin('c', {});
    const b = defineBasePlugin('b', { dependencies: [c] });
    const a = defineBasePlugin('a', { dependencies: [b, c] });

    expect(getSortedKeys([a])).toEqual(['c', 'b', 'a']);
  });

  it('resolves one configured descriptor once across dependency and root paths', () => {
    let calls = 0;
    const dependency = defineBasePlugin('configuredDependency', {
      initialState: { source: 'base' },
    }).configure(() => {
      calls++;

      return { initialState: { source: 'configured' } };
    });
    const dependent = defineBasePlugin('dependent', {
      dependencies: [dependency],
    });
    const editor = createBaseEditor();
    const resolved = resolveAndSortPlugins(editor, [dependent, dependency]);

    expect(calls).toBe(1);
    expect(
      resolved.find((plugin) => plugin.name === dependency.name)?.initialState
    ).toEqual({ source: 'configured' });
  });

  it('whole-replaces a dependency default without leaking its extensions', () => {
    const dependency = defineBasePlugin('extendedDependency', {
      api: () => ({
        dependencyRead: () => 'dependency',
      }),
    });
    const explicitDependency = defineBasePlugin(dependency.name, {
      api: () => ({
        explicitRead: () => 'explicit',
      }),
    });
    const dependent = defineBasePlugin('dependent', {
      dependencies: [dependency],
    });
    const editor = createBaseEditor({
      plugins: [dependent, explicitDependency],
    });

    expect(
      Reflect.get(editor.api.extendedDependency, 'dependencyRead')
    ).toBeUndefined();
    expect(editor.api.extendedDependency.explicitRead()).toBe('explicit');
  });

  it('keeps application order around dependency ordering', () => {
    const c = defineBasePlugin('c', {});
    const b = defineBasePlugin('b', {
      dependencies: [c],
    });
    const a = defineBasePlugin('a', {});

    expect(getSortedKeys([a, b])).toEqual(['a', 'c', 'b']);
  });

  it('uses explicit root configuration regardless of root position', () => {
    const dependency = defineBasePlugin('dependency', {
      initialState: { source: 'implicit' },
    });
    const explicitDependency = dependency.configure({
      initialState: { source: 'explicit' },
    });
    const dependent = defineBasePlugin('dependent', {
      dependencies: [dependency],
    });
    const editor = createBaseEditor();

    for (const roots of [
      [explicitDependency, dependent],
      [dependent, explicitDependency],
    ]) {
      const resolved = resolveAndSortPlugins(editor, roots);

      expect(
        resolved.find((plugin) => plugin.name === 'dependency')?.initialState
      ).toEqual({ source: 'explicit' });
    }
  });

  it('rejects an explicitly disabled required dependency', () => {
    const dependency = defineBasePlugin('dependency', {});
    const dependent = defineBasePlugin('dependent', {
      dependencies: [dependency],
    });

    expect(() =>
      getSortedKeys([dependent, dependency.configure({ enabled: false })])
    ).toThrow(/dependent.*requires disabled plugin "dependency"/);
  });

  it('omits dependencies owned only by a disabled dependent', () => {
    const dependency = defineBasePlugin('dependency', {});
    const dependent = defineBasePlugin('dependent', {
      dependencies: [dependency],
      enabled: false,
    });

    expect(getSortedKeys([dependent])).toEqual([]);
  });

  it('rejects named dependency cycles', () => {
    const a = defineBasePlugin('a', {});
    const b = defineBasePlugin('b', { dependencies: [a] });

    Object.assign(a, { dependencies: [b] });

    expect(() => getSortedKeys([a])).toThrow(
      'Circular plugin dependency: a -> b -> a'
    );
  });

  it('rejects string dependency names', () => {
    const dependent = defineBasePlugin('dependent', {});

    dependent.dependencies = ['missing'] as never;

    expect(() => getSortedKeys([dependent])).toThrow(
      'Pass a plugin descriptor, not its name.'
    );
  });
});

describe('applyPluginOverrides', () => {
  it('uses peer components only when the target has no component', () => {
    const OriginalComponent = () => null;
    const OverrideComponent = () => null;
    const HighPriorityComponent = () => null;
    const PreservedOriginalComponent = () => null;

    const editor = createPlateEditor({
      plugins: [
        definePlatePlugin('a', {
          override: {
            components: {
              b: OverrideComponent,
              c: OverrideComponent,
              d: OverrideComponent,
              e: OverrideComponent,
            },
          },
        }),
        definePlatePlugin('b', {
          component: OriginalComponent,
        }),
        defineBasePlugin('c', {}),
        definePlatePlugin('d', {
          component: OriginalComponent,
        }),
        definePlatePlugin('e', {
          override: {
            components: {
              b: HighPriorityComponent,
              d: HighPriorityComponent,
            },
          },
        }),
        definePlatePlugin('f', {
          component: PreservedOriginalComponent,
        }),
      ],
    });

    expect(editor.plugin('b').render.node).toBe(OriginalComponent);

    // No initial component, so it gets set
    expect(editor.plugin('c').render.node).toBe(OverrideComponent);

    expect(editor.plugin('d').render.node).toBe(OriginalComponent);

    expect(editor.plugin('f').render.node).toBe(PreservedOriginalComponent);
    expect(() => editor.plugin('missing').name).toThrow(
      'Plate plugin "missing" is not installed.'
    );
  });

  it('does not fabricate a descriptor for a disabled plugin', () => {
    const Disabled = definePlatePlugin('disabledPlugin', {
      enabled: false,
    });
    const editor = createPlateEditor({ plugins: [Disabled] });

    expect(editor.plugin(Disabled).installed).toBe(false);
    expect(() => editor.plugin(Disabled).name).toThrow(
      'Plate plugin "disabledPlugin" is not installed.'
    );
  });

  describe('weak plugin overrides', () => {
    it('ignores missing targets without installing them', () => {
      const Contributor = defineBasePlugin('missingTargetContributor', {
        override: {
          plugins: {
            missingTarget: {
              dependencies: [],
              enabled: false,
            } as any,
          },
        },
      });
      const editor = createBaseEditor({ plugins: [Contributor] });

      expect(
        getPlateRuntime(editor).pluginList.map((plugin) => plugin.name)
      ).not.toContain('missingTarget');
    });

    it('keeps direct target configuration terminal and executes it once', () => {
      let calls = 0;
      const Target = defineBasePlugin('strongTarget', {
        initialState: {
          peerOnly: 'base',
          source: 'base',
        },
      }).configure(() => {
        calls++;

        return {
          initialState: {
            source: 'strong',
          },
        };
      });
      const Contributor = defineBasePlugin('strongTargetContributor', {
        override: {
          plugins: {
            [Target.name]: {
              initialState: {
                peerOnly: 'weak',
                source: 'weak',
              },
            },
          },
        },
      });
      const editor = createBaseEditor({
        plugins: [Contributor, Target],
      });

      expect(editor.plugin(Target).initialState).toEqual({
        peerOnly: 'weak',
        source: 'strong',
      });
      expect(calls).toBe(1);
    });

    it('uses earlier application order for overlapping fields', () => {
      const Target = defineBasePlugin('orderedWeakTarget', {
        initialState: { priorityWinner: 'base', sourceWinner: 'base' },
      });
      const Low = defineBasePlugin('lowWeakContributor', {
        override: {
          plugins: {
            [Target.name]: {
              initialState: { priorityWinner: 'low' },
            },
          },
        },
      });
      const High = defineBasePlugin('highWeakContributor', {
        override: {
          plugins: {
            [Target.name]: {
              initialState: { priorityWinner: 'high' },
            },
          },
        },
      });
      const First = defineBasePlugin('firstWeakContributor', {
        override: {
          plugins: {
            [Target.name]: {
              initialState: { sourceWinner: 'first' },
            },
          },
        },
      });
      const Second = defineBasePlugin('secondWeakContributor', {
        override: {
          plugins: {
            [Target.name]: {
              initialState: { sourceWinner: 'second' },
            },
          },
        },
      });
      const editor = createBaseEditor({
        plugins: [Low, High, First, Second, Target],
      });

      expect(editor.plugin(Target).initialState).toEqual({
        priorityWinner: 'low',
        sourceWinner: 'first',
      });
    });

    it('skips disabled contributors', () => {
      const Target = defineBasePlugin('disabledContributorTarget', {
        initialState: { source: 'target' },
      });
      const Contributor = defineBasePlugin('disabledWeakContributor', {
        enabled: false,
        override: {
          plugins: {
            [Target.name]: {
              initialState: { source: 'disabled contributor' },
            },
          },
        },
      });
      const editor = createBaseEditor({
        plugins: [Contributor, Target],
      });

      expect(editor.plugin(Target).initialState.source).toBe('target');
    });

    it('rejects topology fields even through erased input', () => {
      const Target = defineBasePlugin('topologyTarget', {});
      const Contributor = defineBasePlugin('topologyContributor', {
        override: {
          plugins: {
            [Target.name]: {
              dependencies: [],
            } as any,
          },
        },
      });

      expect(() =>
        createBaseEditor({ plugins: [Contributor, Target] })
      ).toThrow(
        'weak override for "topologyTarget" cannot define "dependencies"'
      );
    });

    it('rejects schema replacement through erased weak overrides', () => {
      const Target = defineBasePlugin('weakSchemaTarget', {});
      const Contributor = defineBasePlugin('weakSchemaContributor', {
        override: {
          plugins: {
            [Target.name]: {
              schema: { mark: property.boolean() },
            } as any,
          },
        },
      });

      expect(() =>
        createBaseEditor({ plugins: [Contributor, Target] })
      ).toThrow('weak override for "weakSchemaTarget" cannot define "schema"');
    });

    it('cannot disable a required dependency', () => {
      const Dependency = defineBasePlugin('weakRequiredDependency', {});
      const Dependent = defineBasePlugin('weakRequiredDependent', {
        dependencies: [Dependency],
      });
      const Contributor = defineBasePlugin('weakRequiredContributor', {
        override: {
          plugins: {
            [Dependency.name]: { enabled: false },
          },
        },
      });

      expect(() =>
        createBaseEditor({ plugins: [Contributor, Dependent] })
      ).toThrow(
        /weakRequiredDependent.*requires disabled plugin "weakRequiredDependency"/
      );
    });

    it('cannot beat an explicit target enablement', () => {
      const Target = defineBasePlugin('strongEnabledTarget', {
        enabled: false,
      }).configure({ enabled: true });
      const Contributor = defineBasePlugin('strongEnabledContributor', {
        override: {
          plugins: {
            [Target.name]: { enabled: false },
          },
        },
      });
      const editor = createBaseEditor({
        plugins: [Contributor, Target],
      });

      expect(editor.plugin(Target)).toHaveProperty('enabled', true);
    });
  });

  it('allow overriding core plugins like DebugPlugin', () => {
    const customLogger = mock();

    const editor = createBaseEditor({
      plugins: [
        DebugPlugin.configure({
          initialState: {
            logger: { log: customLogger },
          },
        }),
      ],
    });

    editor.plugin(DebugPlugin).api.log('Test message', 'TEST');

    expect(customLogger).toHaveBeenCalledWith(
      'Test message',
      'TEST',
      undefined
    );
  });
});

describe('mergePlugins behavior in resolvePlugins', () => {
  it('preserves configured initialState when an overlay uses undefined', () => {
    const plugin = defineBasePlugin('test', {
      initialState: {
        contextValue: 'kept',
        nullValue: 'kept',
        objectValue: 'kept',
      },
    }).configure(() => ({
      initialState: {
        contextValue: undefined as unknown as string,
        nullValue: null as unknown as string,
        objectValue: undefined as unknown as string,
      },
    }));

    const editor = createBaseEditor({ plugins: [plugin] });

    expect(getPlateRuntime(editor).plugins.test.initialState).toEqual({
      contextValue: 'kept',
      nullValue: null,
      objectValue: 'kept',
    });
  });

  it('freezes the initialState record without cloning runtime resources', () => {
    class RuntimeResource {
      value = 'original';
    }
    const runtimeResource = new RuntimeResource();
    const plugin = defineBasePlugin('test', {
      initialState: { resource: runtimeResource },
    });

    const editor = createBaseEditor({
      plugins: [plugin],
    });

    const published = editor.plugin(plugin);

    expect(published.initialState).not.toBe(plugin.initialState);
    expect(Object.isFrozen(published.initialState)).toBe(true);
    expect(published.initialState.resource).toBe(runtimeResource);
    expect(editor.plugin(plugin).store.get('resource')).toBe(runtimeResource);
    expect(Object.isFrozen(published.initialState.resource)).toBe(false);
  });

  it('snapshots nested plain initialState away from caller-owned mutation', () => {
    const nested = { label: 'one' };
    const entries = [nested];
    const plugin = defineBasePlugin('test', {
      initialState: { entries, nested },
    });
    const editor = createBaseEditor({ plugins: [plugin] });
    const published = editor.plugin(plugin);
    const listener = vi.fn();
    const unsubscribe = getPluginStore(editor, plugin.name)!.public.subscribe(
      listener
    );

    nested.label = 'mutated';
    entries.push({ label: 'two' });

    expect(published.initialState.nested).toEqual({ label: 'one' });
    expect(published.initialState.nested).not.toBe(nested);
    expect(Object.isFrozen(published.initialState.nested)).toBe(true);
    expect(published.initialState.entries).toEqual([{ label: 'one' }]);
    expect(published.initialState.entries).not.toBe(entries);
    expect(published.initialState.entries[0]).toBe(
      published.initialState.nested
    );
    expect(Object.isFrozen(published.initialState.entries)).toBe(true);
    expect(editor.plugin(plugin).store.get('nested')).toEqual({ label: 'one' });
    expect(listener).not.toHaveBeenCalled();

    editor.plugin(plugin).store.set({ nested: { label: 'updated' } });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(editor.plugin(plugin).store.get('nested')).toEqual({
      label: 'updated',
    });
    expect(published.initialState.nested).toEqual({ label: 'one' });
    unsubscribe();
  });

  it('preserves shared and cyclic identity inside snapshotted plain initialState', () => {
    const shared = { label: 'shared' };
    const cycle: { self?: typeof cycle } = {};

    cycle.self = cycle;
    const plugin = defineBasePlugin('test', {
      initialState: { cycle, first: shared, second: shared },
    });
    const editor = createBaseEditor({ plugins: [plugin] });
    const initialState = editor.plugin(plugin).initialState;

    expect(initialState.first).toBe(initialState.second);
    expect(initialState.first).not.toBe(shared);
    expect(Object.isFrozen(initialState.first)).toBe(true);
    expect(initialState.cycle).not.toBe(cycle);
    expect(initialState.cycle.self).toBe(initialState.cycle);
    expect(Object.isFrozen(initialState.cycle)).toBe(true);
  });

  it('rejects accessor properties in plain plugin state graphs', () => {
    const nested = {} as { value: number };

    Object.defineProperty(nested, 'value', {
      get: () => 1,
      set: () => {},
    });
    const plugin = defineBasePlugin('test', {
      initialState: { nested },
    });

    expect(() => createBaseEditor({ plugins: [plugin] })).toThrow(
      'Plate plugin `initialState` must be data-only. Accessor properties are not supported; declare computed values as pure plugin selectors.'
    );
  });

  it('rejects accessor properties in plain plugin descriptor graphs', () => {
    const rootDescriptor = defineBasePlugin('rootAccessor', {});
    const nested = defineBasePlugin('nestedAccessor', {});

    Object.defineProperty(rootDescriptor, 'priority', {
      enumerable: true,
      get: () => 100,
    });
    Object.defineProperty(nested.render, 'node', {
      enumerable: true,
      get: () => () => null,
    });

    expect(() => createBaseEditor({ plugins: [rootDescriptor] })).toThrow(
      'Plate plugin "rootAccessor" descriptor path "priority" must be data-only. Accessor properties are not supported.'
    );
    expect(() => createBaseEditor({ plugins: [nested] })).toThrow(
      'Plate plugin "nestedAccessor" descriptor path "render.node" must be data-only. Accessor properties are not supported.'
    );
  });

  it('preserves React components as opaque render-slot resources', () => {
    const DirectNode = React.forwardRef<HTMLDivElement>(() => null);
    const Node = React.forwardRef<HTMLDivElement>(() => null);
    const OverrideNode = React.forwardRef<HTMLDivElement>(() => null);
    const directPlugin = definePlatePlugin('directForwardRefHost', {
      component: DirectNode,
    });
    const plugin = definePlatePlugin('forwardRefHost', {
      component: Node,
    }).configure({
      override: { components: { paragraph: OverrideNode } },
    });
    const editor = createPlateEditor({ plugins: [directPlugin, plugin] });
    const published = getPlateRuntime(editor).plugins.forwardRefHost;

    expect(
      getPlateRuntime(editor).plugins.directForwardRefHost.render.node
    ).toBe(DirectNode);
    expect(published.render.node).toBe(Node);
    expect(published.override.components?.paragraph).toBe(OverrideNode);
    expect(Object.isFrozen(published.render)).toBe(true);
    expect(Object.isFrozen(Node)).toBe(false);
    expect(Object.isFrozen(OverrideNode)).toBe(false);
  });

  it('snapshots plugin-valued initialState as frozen nominal references', () => {
    const Target = defineBasePlugin('stateTarget', {});
    const cycle: { self?: typeof cycle; target: typeof Target } = {
      target: Target,
    };

    cycle.self = cycle;
    const Owner = defineBasePlugin('stateOwner', {
      initialState: { cycle, first: Target, second: Target },
    });
    const editor = createBaseEditor({ plugins: [Target, Owner] });
    const publishedState = editor.plugin(Owner).initialState;
    const targetReference = publishedState.first;

    expect(targetReference).toEqual({
      name: 'stateTarget',
    });
    expect(targetReference).toBe(publishedState.second);
    expect(targetReference).toBe(publishedState.cycle.target);
    expect(publishedState.cycle.self).toBe(publishedState.cycle);
    expect(targetReference).not.toBe(Target);
    expect(Object.isFrozen(targetReference)).toBe(true);
    expect(editor.plugin(Owner).store.get('first')).toBe(targetReference);

    const ContextOwner = defineBasePlugin('contextStateOwner', {
      initialState: { target: null as unknown as typeof Target },
    }).extend(() => ({ initialState: { target: Target } }));
    const contextEditor = createBaseEditor({
      plugins: [Target, ContextOwner],
    });
    const contextPublished =
      contextEditor.plugin(ContextOwner).initialState.target;

    expect(contextPublished).toBe(
      contextEditor.plugin(ContextOwner).store.get('target')
    );
    expect(contextPublished).not.toBe(Target);
    expect(contextPublished).not.toBe(targetReference);
    expect(Object.isFrozen(contextPublished)).toBe(true);

    Object.assign(Target, { name: 'mutatedTarget' });

    expect(targetReference).toEqual({
      name: 'stateTarget',
    });
    expect(getPlateRuntime(editor).plugins.stateTarget).toMatchObject({
      name: 'stateTarget',
    });
  });

  it('keeps mutable store state outside the published plugin descriptor', () => {
    const plugin = defineBasePlugin('test', {
      initialState: { value: 'original' },
    });

    const editor = createBaseEditor({
      plugins: [plugin],
    });

    editor.plugin(plugin).store.set({ value: 'modified' });

    expect(editor.plugin(plugin).store.get('value')).toBe('modified');
    expect(editor.plugin(plugin).initialState.value).toBe('original');
    expect(plugin.initialState.value).toBe('original');
  });

  it('keeps extension-derived defaults separate from mutable store state', () => {
    const plugin = defineBasePlugin('test', {
      initialState: { value: 'original' },
    }).extend(({ store }) => ({
      initialState: {
        ...store.get(),
        value: 'modified',
      },
    }));

    const editor = createBaseEditor({
      plugins: [plugin],
    });

    expect(editor.plugin(plugin).initialState.value).toBe('modified');

    editor.plugin(plugin).store.set({ value: 'runtime' });

    expect(editor.plugin(plugin).store.get('value')).toBe('runtime');
    expect(editor.plugin(plugin).initialState.value).toBe('modified');
    expect(plugin.initialState.value).toBe('original');
  });
});
