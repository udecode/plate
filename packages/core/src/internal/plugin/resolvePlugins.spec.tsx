import React from 'react';
import { property } from '@platejs/plite';
import { createBaseEditor } from '../../lib/editor';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';

import { createBasePlugin } from '../../lib/plugin/createBasePlugin';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { createPlateEditor } from '../../react/editor/withPlate';
import { createPlatePlugin } from '../../react/plugin/createPlatePlugin';
import { getPlugin } from '../../react/plugin/getPlugin';
import { getPlateRuntime } from './compilePlateModel';
import { getPluginStore } from './pluginStore';
import { resolveAndSortPlugins, resolvePlugins } from './resolvePlugins';

const getSortedKeys = (plugins: readonly AnyBasePlugin[]) => {
  const editor = createBaseEditor();

  return resolveAndSortPlugins(editor, plugins).map((plugin) => plugin.key);
};

describe('resolvePlugins', () => {
  it('compiles input-rule declarations once into the published runtime', () => {
    let calls = 0;
    const Plugin = createBasePlugin({
      key: 'singleInputRuleCompilation',
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
        createBasePlugin({ key: 'a' }),
        createBasePlugin({ key: 'b' }),
        createBasePlugin({ key: 'c' }),
      ])
    ).toEqual(['a', 'b', 'c']);
  });

  it('installs required dependencies', () => {
    const pluginKeys = getSortedKeys([
      createBasePlugin({
        dependencies: [
          createBasePlugin({ key: 'dependency1' }),
          createBasePlugin({ key: 'dependency2' }),
        ],
        key: 'parent',
      }),
    ]);

    expect(pluginKeys).toContain('parent');
    expect(pluginKeys).toContain('dependency1');
    expect(pluginKeys).toContain('dependency2');
  });

  it('does not include disabled plugins', () => {
    const pluginKeys = getSortedKeys([
      createBasePlugin({ key: 'enabled' }),
      createBasePlugin({ key: 'disabled', enabled: false }),
    ]);

    expect(pluginKeys).toContain('enabled');
    expect(pluginKeys).not.toContain('disabled');
  });

  it('publishes plugin APIs by key and descriptor portal', () => {
    const Plugin1 = createBasePlugin({
      key: 'plugin1',
      api: { methodA: () => 'A' },
    });
    const Plugin2 = createBasePlugin({
      key: 'plugin2',
      api: { methodB: () => 'B' },
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
    const Plugin = createBasePlugin({
      key: 'unifiedRuntime',
      initialState: { label: 'unified' },
    })
      .extend(({ store }) => {
        extensionCalls++;

        return {
          api: {
            label: () => store.get().label,
          },
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
            selectAndRead: () => {
              tx.selection.set({ offset: 0, path: [0, 0] });

              return tx.unifiedRuntime.hasSelection();
            },
          }),
        };
      });
    const editor = createBaseEditor({
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
      plugins: [Plugin],
    });

    expect(extensionCalls).toBe(2);
    expect(editor.plugin(Plugin).api.label()).toBe('unified');
    expect(editor.plugin(Plugin).store.get('selected')).toBe(false);
    expect(editor.read.unifiedRuntime.hasSelection()).toBe(false);
    expect(editor.plugin(Plugin).read.hasSelection()).toBe(false);
    editor.read((state) =>
      state.transaction((tx) => {
        expect(tx.unifiedRuntime.hasSelection()).toBe(false);
        tx.selection.set({ offset: 0, path: [0, 0] });
        expect(tx.unifiedRuntime.hasSelection()).toBe(true);
      })
    );
    expect(editor.read.unifiedRuntime.hasSelection()).toBe(false);
    expect(editor.update.unifiedRuntime.apiLabel()).toBe('unified');
    const directRead = Reflect.get(
      editor.update.unifiedRuntime,
      'hasSelection'
    );

    expect(() => Reflect.apply(directRead, undefined, [])).toThrow('read-only');
    expect(editor.update.unifiedRuntime.selectAndRead()).toBe(true);
    expect(editor.plugin(Plugin).read.hasSelection()).toBe(true);
    expect(editor.plugin(Plugin).update.selectAndRead()).toBe(true);
  });

  it('registers constructor-authored unified contributions', () => {
    const Plugin = createBasePlugin({
      api: {
        label: () => 'object',
      },
      extension: {
        api: {
          rootObjectUnifiedRuntime: {
            label: () => 'root',
          },
        },
      },
      key: 'objectUnifiedRuntime',
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
    expect(editor.api.rootObjectUnifiedRuntime.label()).toBe('root');
    expect(editor.read.objectUnifiedRuntime.ready()).toBe(true);
    expect(editor.plugin(Plugin).store.get('selected')).toBe(true);
    expect(editor.update.objectUnifiedRuntime.label()).toBe('update');
  });

  it('overwrite API methods with the same name', () => {
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'plugin1',
          extension: {
            api: { method: (_: string) => 'first' },
          },
        }),
        createBasePlugin({
          key: 'plugin2',
          extension: {
            api: { method: (_: number) => 'second' },
          },
        }),
      ],
    });

    expect(Reflect.apply(editor.api.method, undefined, [1])).toBe('second');
  });

  it('fills plugin cache buckets for node, render, hook, rule, and handler metadata', () => {
    const editor = createBaseEditor({
      plugins: [
        Object.assign(
          createPlatePlugin({
            key: 'cachey',
            type: 'cachey',
            schema: {
              mark: property.boolean({ default: false, omitDefault: true }),
            },
            decorate: () => [],
            handlers: {
              onNodeChange: () => {},
              onTextChange: () => {},
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
    expect(getPlateRuntime(editor).pluginCache.handlers.onNodeChange).toContain(
      'cachey'
    );
    expect(getPlateRuntime(editor).pluginCache.handlers.onTextChange).toContain(
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
        createBasePlugin({
          key: 'shortcutTx',
          update: () => ({ toggle }),
        }).extend({ shortcuts: { toggle: { keys: 'mod+k' } } }),
      ],
    });

    getPlateRuntime(editor).shortcuts['shortcutTx.toggle']?.handler?.(
      {} as any
    );

    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('creates a shortcut handler from an editor extension update group owned by the plugin', () => {
    const insert = mock();
    const plugin = createBasePlugin({
      key: 'shortcutRootTx',
      extension: {
        tx: {
          shortcutRootTx: () => ({ insert }),
        },
      },
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
        createBasePlugin({ key: 'shortcutMixed', update: () => ({ other }) })
          .extend(() => ({ api: { toggle } }))
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
          createBasePlugin({
            key: 'shortcutMissing',
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
        createBasePlugin({
          key: 'shortcutTxFalse',
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

  it('does not treat foreign update groups as plugin shortcut commands', () => {
    const replace = mock();
    const create = () =>
      createBaseEditor({
        plugins: [
          createBasePlugin({
            key: 'shortcutForeign',
            extension: { tx: { foreignTx: () => ({ replace }) } },
          }).extend({
            shortcuts: {
              replace: { keys: 'mod+k' },
            } as any,
          }),
        ],
      });

    expect(create).toThrow(
      'Plate shortcut "shortcutForeign.replace" does not match a public update or API command.'
    );
  });

  it('requires target only when update and api commands collide', () => {
    const apiToggle = mock();
    const updateToggle = mock();
    const AmbiguousPlugin = createBasePlugin({
      key: 'shortcutAmbiguous',
      api: { toggle: apiToggle },
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
          createBasePlugin({
            key: 'shortcutHandlerTarget',
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
        createBasePlugin({ key: 'shortcutApi', api: { toggle } }).extend({
          shortcuts: { toggle: { keys: 'mod+k' } },
        }),
      ],
    });

    getPlateRuntime(editor).shortcuts['shortcutApi.toggle']?.handler?.(
      {} as any
    );

    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('routes shortcuts through api methods contributed at the editor root', () => {
    const inspect = mock();
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'shortcutRootApi',
          extension: { api: { inspect } },
        }).extend({ shortcuts: { inspect: { keys: 'mod+k' } } }),
      ],
    });

    getPlateRuntime(editor).shortcuts['shortcutRootApi.inspect']?.handler?.(
      {} as any
    );

    expect(inspect).toHaveBeenCalledTimes(1);
  });

  it('rejects the same shortcut command in plugin and editor api scopes', () => {
    const inspectPlugin = mock();
    const inspectEditor = mock();
    const Plugin = createBasePlugin({
      key: 'shortcutApiScopeCollision',
      api: { inspect: inspectPlugin },
    })
      .extend(() => ({ extension: { api: { inspect: inspectEditor } } }))
      .extend({ shortcuts: { inspect: { keys: 'mod+k' } } as any });

    expect(() => createBaseEditor({ plugins: [Plugin] })).toThrow(
      'Plate shortcut "shortcutApiScopeCollision.inspect" matches API commands in both plugin and editor scopes.'
    );
  });

  it('rejects plugin-set mutation after atomic model publication', () => {
    const PluginApi = createBasePlugin({
      key: 'pluginApi',
      api: {
        run: () => 'run',
      },
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
          createBasePlugin({
            key: 'marks',
          }).configure({
            inputRules: { markdown: true } as any,
          }),
        ],
      })
    ).toThrow(
      'inputRules config must be an array of explicit rule instances or a factory.'
    );
  });
});

describe('resolveAndSortPlugins', () => {
  it('keeps independent roots in application order', () => {
    expect(
      getSortedKeys([
        createBasePlugin({ key: 'a' }),
        createBasePlugin({ key: 'b' }),
        createBasePlugin({ key: 'c' }),
      ])
    ).toEqual(['a', 'b', 'c']);
  });

  it('installs direct and transitive dependencies once', () => {
    const c = createBasePlugin({ key: 'c' });
    const b = createBasePlugin({ dependencies: [c], key: 'b' });
    const a = createBasePlugin({ dependencies: [b, c], key: 'a' });

    expect(getSortedKeys([a])).toEqual(['c', 'b', 'a']);
  });

  it('resolves one configured descriptor once across dependency and root paths', () => {
    let calls = 0;
    const dependency = createBasePlugin({
      key: 'configuredDependency',
      initialState: { source: 'base' },
    }).configure(() => {
      calls++;

      return { initialState: { source: 'configured' } };
    });
    const dependent = createBasePlugin({
      dependencies: [dependency],
      key: 'dependent',
    });
    const editor = createBaseEditor();
    const resolved = resolveAndSortPlugins(editor, [dependent, dependency]);

    expect(calls).toBe(1);
    expect(
      resolved.find((plugin) => plugin.key === dependency.key)?.initialState
    ).toEqual({ source: 'configured' });
  });

  it('whole-replaces a dependency default without leaking its extensions', () => {
    const dependency = createBasePlugin({
      key: 'extendedDependency',
      extension: {
        api: {
          dependencyExtension: {
            read: () => 'dependency',
          },
        },
      },
    });
    const explicitDependency = createBasePlugin({
      key: dependency.key,
      extension: {
        api: {
          explicitExtension: {
            read: () => 'explicit',
          },
        },
      },
    });
    const dependent = createBasePlugin({
      dependencies: [dependency],
      key: 'dependent',
    });
    const editor = createBaseEditor({
      plugins: [dependent, explicitDependency],
    });

    expect((editor.api as any).dependencyExtension).toBeUndefined();
    expect(editor.api.explicitExtension.read()).toBe('explicit');
  });

  it('keeps application order around dependency ordering', () => {
    const c = createBasePlugin({ key: 'c' });
    const b = createBasePlugin({
      dependencies: [c],
      key: 'b',
    });
    const a = createBasePlugin({ key: 'a' });

    expect(getSortedKeys([a, b])).toEqual(['a', 'c', 'b']);
  });

  it('uses explicit root configuration regardless of root position', () => {
    const dependency = createBasePlugin({
      key: 'dependency',
      initialState: { source: 'implicit' },
    });
    const explicitDependency = dependency.configure({
      initialState: { source: 'explicit' },
    });
    const dependent = createBasePlugin({
      dependencies: [dependency],
      key: 'dependent',
    });
    const editor = createBaseEditor();

    for (const roots of [
      [explicitDependency, dependent],
      [dependent, explicitDependency],
    ]) {
      const resolved = resolveAndSortPlugins(editor, roots);

      expect(
        resolved.find((plugin) => plugin.key === 'dependency')?.initialState
      ).toEqual({ source: 'explicit' });
    }
  });

  it('rejects an explicitly disabled required dependency', () => {
    const dependency = createBasePlugin({ key: 'dependency' });
    const dependent = createBasePlugin({
      dependencies: [dependency],
      key: 'dependent',
    });

    expect(() =>
      getSortedKeys([dependent, dependency.configure({ enabled: false })])
    ).toThrow(/dependent.*requires disabled plugin "dependency"/);
  });

  it('omits dependencies owned only by a disabled dependent', () => {
    const dependency = createBasePlugin({ key: 'dependency' });
    const dependent = createBasePlugin({
      dependencies: [dependency],
      enabled: false,
      key: 'dependent',
    });

    expect(getSortedKeys([dependent])).toEqual([]);
  });

  it('rejects named dependency cycles', () => {
    const a = createBasePlugin({ key: 'a' });
    const b = createBasePlugin({ dependencies: [a], key: 'b' });

    Object.assign(a, { dependencies: [b] });

    expect(() => getSortedKeys([a])).toThrow(
      'Circular plugin dependency: a -> b -> a'
    );
  });

  it('rejects string dependency keys', () => {
    const dependent = createBasePlugin({ key: 'dependent' });

    dependent.dependencies = ['missing'] as never;

    expect(() => getSortedKeys([dependent])).toThrow(
      'Pass a plugin descriptor, not its key.'
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
        createPlatePlugin({
          key: 'a',
          override: {
            components: {
              b: OverrideComponent,
              c: OverrideComponent,
              d: OverrideComponent,
              e: OverrideComponent,
            },
          },
        }),
        createPlatePlugin({
          component: OriginalComponent,
          key: 'b',
        }),
        createBasePlugin({
          key: 'c',
        }),
        createPlatePlugin({
          component: OriginalComponent,
          key: 'd',
        }),
        createPlatePlugin({
          key: 'e',
          override: {
            components: {
              b: HighPriorityComponent,
              d: HighPriorityComponent,
            },
          },
        }),
        createPlatePlugin({
          component: PreservedOriginalComponent,
          key: 'f',
        }),
      ],
    });

    expect(getPlugin(editor, { key: 'b' }).render.node).toBe(OriginalComponent);

    // No initial component, so it gets set
    expect(getPlugin(editor, { key: 'c' }).render.node).toBe(OverrideComponent);

    expect(getPlugin(editor, { key: 'd' }).render.node).toBe(OriginalComponent);

    expect(getPlugin(editor, { key: 'f' }).render.node).toBe(
      PreservedOriginalComponent
    );
    expect(() => getPlugin(editor, { key: 'missing' })).toThrow(
      'Plate plugin "missing" is not installed.'
    );
  });

  it('does not fabricate a descriptor for a disabled plugin', () => {
    const Disabled = createPlatePlugin({
      enabled: false,
      key: 'disabledPlugin',
    });
    const editor = createPlateEditor({ plugins: [Disabled] });

    expect(editor.plugin(Disabled).installed).toBe(false);
    expect(() => getPlugin(editor, Disabled)).toThrow(
      'Plate plugin "disabledPlugin" is not installed.'
    );
  });

  describe('weak plugin overrides', () => {
    it('ignores missing targets without installing them', () => {
      const Contributor = createBasePlugin({
        key: 'missingTargetContributor',
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
        getPlateRuntime(editor).pluginList.map((plugin) => plugin.key)
      ).not.toContain('missingTarget');
    });

    it('keeps direct target configuration terminal and executes it once', () => {
      let calls = 0;
      const Target = createBasePlugin({
        key: 'strongTarget',
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
      const Contributor = createBasePlugin({
        key: 'strongTargetContributor',
        override: {
          plugins: {
            [Target.key]: {
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

      expect(editor.getPlugin(Target).initialState).toEqual({
        peerOnly: 'weak',
        source: 'strong',
      });
      expect(calls).toBe(1);
    });

    it('uses earlier application order for overlapping fields', () => {
      const Target = createBasePlugin({
        key: 'orderedWeakTarget',
        initialState: { priorityWinner: 'base', sourceWinner: 'base' },
      });
      const Low = createBasePlugin({
        key: 'lowWeakContributor',
        override: {
          plugins: {
            [Target.key]: {
              initialState: { priorityWinner: 'low' },
            },
          },
        },
      });
      const High = createBasePlugin({
        key: 'highWeakContributor',
        override: {
          plugins: {
            [Target.key]: {
              initialState: { priorityWinner: 'high' },
            },
          },
        },
      });
      const First = createBasePlugin({
        key: 'firstWeakContributor',
        override: {
          plugins: {
            [Target.key]: {
              initialState: { sourceWinner: 'first' },
            },
          },
        },
      });
      const Second = createBasePlugin({
        key: 'secondWeakContributor',
        override: {
          plugins: {
            [Target.key]: {
              initialState: { sourceWinner: 'second' },
            },
          },
        },
      });
      const editor = createBaseEditor({
        plugins: [Low, High, First, Second, Target],
      });

      expect(editor.getPlugin(Target).initialState).toEqual({
        priorityWinner: 'low',
        sourceWinner: 'first',
      });
    });

    it('skips disabled contributors', () => {
      const Target = createBasePlugin({
        key: 'disabledContributorTarget',
        initialState: { source: 'target' },
      });
      const Contributor = createBasePlugin({
        enabled: false,
        key: 'disabledWeakContributor',
        override: {
          plugins: {
            [Target.key]: {
              initialState: { source: 'disabled contributor' },
            },
          },
        },
      });
      const editor = createBaseEditor({
        plugins: [Contributor, Target],
      });

      expect(editor.getPlugin(Target).initialState.source).toBe('target');
    });

    it('rejects topology fields even through erased input', () => {
      const Target = createBasePlugin({ key: 'topologyTarget' });
      const Contributor = createBasePlugin({
        key: 'topologyContributor',
        override: {
          plugins: {
            [Target.key]: {
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
      const Target = createBasePlugin({ key: 'weakSchemaTarget' });
      const Contributor = createBasePlugin({
        key: 'weakSchemaContributor',
        override: {
          plugins: {
            [Target.key]: {
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
      const Dependency = createBasePlugin({ key: 'weakRequiredDependency' });
      const Dependent = createBasePlugin({
        dependencies: [Dependency],
        key: 'weakRequiredDependent',
      });
      const Contributor = createBasePlugin({
        key: 'weakRequiredContributor',
        override: {
          plugins: {
            [Dependency.key]: { enabled: false },
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
      const Target = createBasePlugin({
        enabled: false,
        key: 'strongEnabledTarget',
      }).configure({ enabled: true });
      const Contributor = createBasePlugin({
        key: 'strongEnabledContributor',
        override: {
          plugins: {
            [Target.key]: { enabled: false },
          },
        },
      });
      const editor = createBaseEditor({
        plugins: [Contributor, Target],
      });

      expect(editor.getPlugin(Target).enabled).toBe(true);
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
    const plugin = createBasePlugin({
      key: 'test',
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
    const plugin = createBasePlugin({
      key: 'test',
      initialState: { resource: runtimeResource },
    });

    const editor = createBaseEditor({
      plugins: [plugin],
    });

    const published = editor.getPlugin(plugin);

    expect(published.initialState).not.toBe(plugin.initialState);
    expect(Object.isFrozen(published.initialState)).toBe(true);
    expect(published.initialState.resource).toBe(runtimeResource);
    expect(editor.plugin(plugin).store.get('resource')).toBe(runtimeResource);
    expect(Object.isFrozen(published.initialState.resource)).toBe(false);
  });

  it('snapshots nested plain initialState away from caller-owned mutation', () => {
    const nested = { label: 'one' };
    const entries = [nested];
    const plugin = createBasePlugin({
      key: 'test',
      initialState: { entries, nested },
    });
    const editor = createBaseEditor({ plugins: [plugin] });
    const published = editor.getPlugin(plugin);
    const listener = vi.fn();
    const unsubscribe = getPluginStore(editor, plugin.key)!.public.subscribe(
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
    const plugin = createBasePlugin({
      key: 'test',
      initialState: { cycle, first: shared, second: shared },
    });
    const editor = createBaseEditor({ plugins: [plugin] });
    const initialState = editor.getPlugin(plugin).initialState;

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
    const plugin = createBasePlugin({
      key: 'test',
      initialState: { nested },
    });

    expect(() => createBaseEditor({ plugins: [plugin] })).toThrow(
      'Plate plugin `initialState` must be data-only. Accessor properties are not supported; declare computed values as pure plugin selectors.'
    );
  });

  it('rejects accessor properties in plain plugin descriptor graphs', () => {
    const topLevel = createBasePlugin({ key: 'topLevelAccessor' });
    const nested = createBasePlugin({ key: 'nestedAccessor' });

    Object.defineProperty(topLevel, 'priority', {
      enumerable: true,
      get: () => 100,
    });
    Object.defineProperty(nested.render, 'node', {
      enumerable: true,
      get: () => () => null,
    });

    expect(() => createBaseEditor({ plugins: [topLevel] })).toThrow(
      'Plate plugin "topLevelAccessor" descriptor path "priority" must be data-only. Accessor properties are not supported.'
    );
    expect(() => createBaseEditor({ plugins: [nested] })).toThrow(
      'Plate plugin "nestedAccessor" descriptor path "render.node" must be data-only. Accessor properties are not supported.'
    );
  });

  it('preserves React components as opaque render-slot resources', () => {
    const DirectNode = React.forwardRef<HTMLDivElement>(() => null);
    const Node = React.forwardRef<HTMLDivElement>(() => null);
    const OverrideNode = React.forwardRef<HTMLDivElement>(() => null);
    const directPlugin = createPlatePlugin({
      component: DirectNode,
      key: 'directForwardRefHost',
    });
    const plugin = createPlatePlugin({
      component: Node,
      key: 'forwardRefHost',
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
    const Target = createBasePlugin({ key: 'stateTarget' });
    const cycle: { self?: typeof cycle; target: typeof Target } = {
      target: Target,
    };

    cycle.self = cycle;
    const Owner = createBasePlugin({
      key: 'stateOwner',
      initialState: { cycle, first: Target, second: Target },
    });
    const editor = createBaseEditor({ plugins: [Target, Owner] });
    const publishedState = editor.getPlugin(Owner).initialState;
    const targetReference = publishedState.first;

    expect(targetReference).toEqual({
      key: 'stateTarget',
      type: 'stateTarget',
    });
    expect(targetReference).toBe(publishedState.second);
    expect(targetReference).toBe(publishedState.cycle.target);
    expect(publishedState.cycle.self).toBe(publishedState.cycle);
    expect(targetReference).not.toBe(Target);
    expect(Object.isFrozen(targetReference)).toBe(true);
    expect(editor.plugin(Owner).store.get('first')).toBe(targetReference);

    const ContextOwner = createBasePlugin({
      key: 'contextStateOwner',
      initialState: { target: null as unknown as typeof Target },
    }).extend(() => ({ initialState: { target: Target } }));
    const contextEditor = createBaseEditor({
      plugins: [Target, ContextOwner],
    });
    const contextPublished =
      contextEditor.getPlugin(ContextOwner).initialState.target;

    expect(contextPublished).toBe(
      contextEditor.plugin(ContextOwner).store.get('target')
    );
    expect(contextPublished).not.toBe(Target);
    expect(contextPublished).not.toBe(targetReference);
    expect(Object.isFrozen(contextPublished)).toBe(true);

    Object.assign(Target, { key: 'mutatedTarget', type: 'mutatedTarget' });

    expect(targetReference).toEqual({
      key: 'stateTarget',
      type: 'stateTarget',
    });
    expect(getPlateRuntime(editor).plugins.stateTarget).toMatchObject({
      key: 'stateTarget',
      type: 'stateTarget',
    });
  });

  it('keeps mutable store state outside the published plugin descriptor', () => {
    const plugin = createBasePlugin({
      key: 'test',
      initialState: { value: 'original' },
    });

    const editor = createBaseEditor({
      plugins: [plugin],
    });

    editor.plugin(plugin).store.set({ value: 'modified' });

    expect(editor.plugin(plugin).store.get('value')).toBe('modified');
    expect(editor.getPlugin(plugin).initialState.value).toBe('original');
    expect(plugin.initialState.value).toBe('original');
  });

  it('keeps extension-derived defaults separate from mutable store state', () => {
    const plugin = createBasePlugin({
      key: 'test',
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

    expect(editor.getPlugin(plugin).initialState.value).toBe('modified');

    editor.plugin(plugin).store.set({ value: 'runtime' });

    expect(editor.plugin(plugin).store.get('value')).toBe('runtime');
    expect(editor.getPlugin(plugin).initialState.value).toBe('modified');
    expect(plugin.initialState.value).toBe('original');
  });
});
