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
import { getPluginOptionsStore } from './pluginOptionsStore';
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

  it('initialize plugins with correct order based on priority', () => {
    expect(
      getSortedKeys([
        createBasePlugin({ key: 'a', priority: 1 }),
        createBasePlugin({ key: 'b', priority: 3 }),
        createBasePlugin({ key: 'c', priority: 2 }),
      ])
    ).toEqual(['b', 'c', 'a']);
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

  it('merge all plugin APIs into editor.api', () => {
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'plugin1',
          api: { methodA: () => 'A' },
        }),
        createBasePlugin({
          key: 'plugin2',
          api: { methodB: () => 'B' },
        }),
      ],
    });

    expect(editor.api.methodA).toBeDefined();
    expect(editor.api.methodB).toBeDefined();
    expect(editor.api.methodA()).toBe('A');
    expect(editor.api.methodB()).toBe('B');
  });

  it('compiles staged read, update, and editor-extension contributions', () => {
    let extensionCalls = 0;
    const Plugin = createBasePlugin({
      key: 'unifiedRuntime',
      options: { label: 'unified' },
    })
      .extend<{
        api: { label: () => string };
        read: { hasSelection: () => boolean };
        selectors: { selected: () => boolean };
      }>(({ getOptions }) => {
        extensionCalls++;

        return {
          api: {
            label: () => getOptions().label,
          },
          read: ({ state }) => ({
            hasSelection: () => state.selection() !== null,
          }),
          selectors: {
            selected: () => false,
          },
        };
      })
      .extend<{
        update: { apiLabel: () => string; selectAndRead: () => boolean };
      }>(({ api, read }) => {
        extensionCalls++;
        const hasSelection = read.hasSelection;

        void hasSelection;

        return {
          extension: { priority: 101 },
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
    expect(editor.plugin(Plugin).getOption('selected')).toBe(false);
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

  it('overwrite API methods with the same name', () => {
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin<'plugin1'>({
          key: 'plugin1',
          api: { method: (_: string) => 'first' },
        }),
        createBasePlugin({
          key: 'plugin2',
          api: { method: (_: number) => 'second' },
        }),
      ],
    });

    expect(editor.api.method(1)).toBe('second');
  });

  it('fills plugin cache buckets for node, render, hook, rule, and handler metadata', () => {
    const editor = createBaseEditor({
      plugins: [
        Object.assign(
          createPlatePlugin({
            key: 'cachey',
            decorate: () => [],
            handlers: {
              onNodeChange: () => {},
              onTextChange: () => {},
            },
            type: 'cachey',
            schema: {
              mark: property.boolean({ default: false, omitDefault: true }),
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
        createBasePlugin({ key: 'shortcutTx' })
          .extendTx(() => () => ({ toggle }))
          .extend({ shortcuts: { toggle: { keys: 'mod+k' } } }),
      ],
    });

    getPlateRuntime(editor).shortcuts['shortcutTx.toggle']?.handler?.(
      {} as any
    );

    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('infers plugin-specific api when update has no matching command', () => {
    const other = mock();
    const toggle = mock() as any;
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({ key: 'shortcutMixed' })
          .extendTx(() => () => ({ other }))
          .extendApi(() => ({ toggle }))
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
          createBasePlugin({ key: 'shortcutMissing' })
            .extendTx(() => () => ({ other }))
            .extend({
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
        createBasePlugin({ key: 'shortcutTxFalse' })
          .extendTx(() => () => ({ untab }))
          .extend({ shortcuts: { untab: { keys: 'shift+tab' } } }),
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
          createBasePlugin({ key: 'shortcutForeign' })
            .extendTxGroup('foreignTx', () => () => ({ replace }))
            .extend({
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
    const AmbiguousPlugin = createBasePlugin({ key: 'shortcutAmbiguous' })
      .extendApi(() => ({ toggle: apiToggle }))
      .extendTx(() => () => ({ toggle: updateToggle }))
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
        createBasePlugin({ key: 'shortcutApi' })
          .extendApi(() => ({ toggle }))
          .extend({ shortcuts: { toggle: { keys: 'mod+k' } } }),
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
        createBasePlugin({ key: 'shortcutRootApi' })
          .extendEditorApi(() => ({ inspect }))
          .extend({ shortcuts: { inspect: { keys: 'mod+k' } } }),
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
    const Plugin = createBasePlugin({ key: 'shortcutApiScopeCollision' })
      .extendApi(() => ({ inspect: inspectPlugin }))
      .extendEditorApi(() => ({ inspect: inspectEditor }))
      .extend({ shortcuts: { inspect: { keys: 'mod+k' } } as any });

    expect(() => createBaseEditor({ plugins: [Plugin] })).toThrow(
      'Plate shortcut "shortcutApiScopeCollision.inspect" matches API commands in both plugin and editor scopes.'
    );
  });

  it('rejects plugin-set mutation after atomic model publication', () => {
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'pluginApi',
        }).extendApi(() => ({
          run: () => 'run',
        })),
      ],
    });

    expect(editor.plugin({ key: 'pluginApi' }).api.run()).toBe('run');
    expect(editor.api.pluginApi.run()).toBe('run');
    expect(editor.plugin({ key: 'pluginApi' }).api).toBe(editor.api.pluginApi);

    expect(() => resolvePlugins(editor, [])).toThrow(
      'Plate plugins are fixed after model publication. Configure plugin options before creating the editor.'
    );
    expect(editor.plugin({ key: 'pluginApi' }).api.run()).toBe('run');
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
  it('sorts roots by priority', () => {
    expect(
      getSortedKeys([
        createBasePlugin({ key: 'a', priority: 1 }),
        createBasePlugin({ key: 'b', priority: 3 }),
        createBasePlugin({ key: 'c', priority: 2 }),
      ])
    ).toEqual(['b', 'c', 'a']);
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
      options: { source: 'base' },
    }).configure(() => {
      calls++;

      return { options: { source: 'configured' } };
    });
    const dependent = createBasePlugin({
      dependencies: [dependency],
      key: 'dependent',
    });
    const editor = createBaseEditor();
    const resolved = resolveAndSortPlugins(editor, [dependent, dependency]);

    expect(calls).toBe(1);
    expect(
      resolved.find((plugin) => plugin.key === dependency.key)?.options.source
    ).toBe('configured');
  });

  it('whole-replaces a dependency default without leaking its extensions', () => {
    const dependency = createBasePlugin({
      key: 'extendedDependency',
    }).extendExtension({
      api: {
        dependencyExtension: {
          read: () => 'dependency',
        },
      },
    });
    const explicitDependency = createBasePlugin({
      key: dependency.key,
    }).extendExtension({
      api: {
        explicitExtension: {
          read: () => 'explicit',
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

  it('keeps independent root priority around dependency ordering', () => {
    const c = createBasePlugin({ key: 'c', priority: 1 });
    const b = createBasePlugin({ dependencies: [c], key: 'b', priority: 2 });
    const a = createBasePlugin({ key: 'a', priority: 3 });

    expect(getSortedKeys([a, b])).toEqual(['a', 'c', 'b']);
  });

  it('uses explicit root configuration regardless of root position', () => {
    const dependency = createBasePlugin({
      key: 'dependency',
      options: { source: 'implicit' },
    });
    const explicitDependency = dependency.configure({
      options: { source: 'explicit' },
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
        resolved.find((plugin) => plugin.key === 'dependency')?.options.source
      ).toBe('explicit');
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
  it('override components based on priority only if target plugin has a component', () => {
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
          priority: 2,
        }),
        createPlatePlugin({
          key: 'b',
          priority: 3,
          render: { node: OriginalComponent },
        }),
        createBasePlugin({
          key: 'c',
          priority: 1,
        }),
        createPlatePlugin({
          key: 'd',
          priority: 1,
          render: { node: OriginalComponent },
        }),
        createPlatePlugin({
          key: 'e',
          override: {
            components: {
              b: HighPriorityComponent,
              d: HighPriorityComponent,
            },
          },
          priority: 4,
        }),
        createPlatePlugin({
          key: 'f',
          priority: 5,
          render: { node: PreservedOriginalComponent },
        }),
      ],
    });

    // Higher priority override
    expect(getPlugin(editor, { key: 'b' }).render.node).toBe(
      HighPriorityComponent
    );

    // No initial component, so it gets set
    expect(getPlugin(editor, { key: 'c' }).render.node).toBe(OverrideComponent);

    // Lower priority component gets overridden
    expect(getPlugin(editor, { key: 'd' }).render.node).toBe(
      HighPriorityComponent
    );

    // Highest priority original component is preserved
    expect(getPlugin(editor, { key: 'f' }).render.node).toBe(
      PreservedOriginalComponent
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
        options: {
          peerOnly: 'base',
          source: 'base',
        },
      }).configure(() => {
        calls++;

        return {
          options: {
            source: 'strong',
          },
        };
      });
      const Contributor = createBasePlugin({
        key: 'strongTargetContributor',
        override: {
          plugins: {
            [Target.key]: {
              options: {
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

      expect(editor.getPlugin(Target).options).toEqual({
        peerOnly: 'weak',
        source: 'strong',
      });
      expect(calls).toBe(1);
    });

    it('uses higher priority, then earlier source order for overlapping fields', () => {
      const Target = createBasePlugin({
        key: 'orderedWeakTarget',
        options: { priorityWinner: 'base', sourceWinner: 'base' },
      });
      const Low = createBasePlugin({
        key: 'lowWeakContributor',
        override: {
          plugins: {
            [Target.key]: {
              options: { priorityWinner: 'low' },
            },
          },
        },
        priority: 1,
      });
      const High = createBasePlugin({
        key: 'highWeakContributor',
        override: {
          plugins: {
            [Target.key]: {
              options: { priorityWinner: 'high' },
            },
          },
        },
        priority: 2,
      });
      const First = createBasePlugin({
        key: 'firstWeakContributor',
        override: {
          plugins: {
            [Target.key]: {
              options: { sourceWinner: 'first' },
            },
          },
        },
        priority: 3,
      });
      const Second = createBasePlugin({
        key: 'secondWeakContributor',
        override: {
          plugins: {
            [Target.key]: {
              options: { sourceWinner: 'second' },
            },
          },
        },
        priority: 3,
      });
      const editor = createBaseEditor({
        plugins: [Low, High, First, Second, Target],
      });

      expect(editor.getPlugin(Target).options).toEqual({
        priorityWinner: 'high',
        sourceWinner: 'first',
      });
    });

    it('skips disabled contributors', () => {
      const Target = createBasePlugin({
        key: 'disabledContributorTarget',
        options: { source: 'target' },
      });
      const Contributor = createBasePlugin({
        enabled: false,
        key: 'disabledWeakContributor',
        override: {
          plugins: {
            [Target.key]: {
              options: { source: 'disabled contributor' },
            },
          },
        },
      });
      const editor = createBaseEditor({
        plugins: [Contributor, Target],
      });

      expect(editor.getPlugin(Target).options.source).toBe('target');
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
          options: {
            logger: { log: customLogger },
          },
        }),
      ],
    });

    editor.api.debug.log('Test message', 'TEST');

    expect(customLogger).toHaveBeenCalledWith(
      'Test message',
      'TEST',
      undefined
    );
  });
});

describe('mergePlugins behavior in resolvePlugins', () => {
  it('preserves configured options when an overlay uses undefined', () => {
    const plugin = createBasePlugin({
      key: 'test',
      options: {
        contextValue: 'kept',
        nullValue: 'kept',
        objectValue: 'kept',
      },
    }).configure(() => ({
      options: {
        contextValue: undefined as unknown as string,
        nullValue: null as unknown as string,
        objectValue: undefined as unknown as string,
      },
    }));

    const editor = createBaseEditor({ plugins: [plugin] });

    expect(getPlateRuntime(editor).plugins.test.options).toEqual({
      contextValue: 'kept',
      nullValue: null,
      objectValue: 'kept',
    });
  });

  it('freezes the options record without cloning runtime resources', () => {
    class RuntimeResource {
      value = 'original';
    }
    const runtimeResource = new RuntimeResource();
    const plugin = createBasePlugin({
      key: 'test',
      options: { resource: runtimeResource },
    });

    const editor = createBaseEditor({
      plugins: [plugin],
    });

    const published = getPlateRuntime(editor).plugins.test;

    expect(published.options).not.toBe(plugin.options);
    expect(Object.isFrozen(published.options)).toBe(true);
    expect(published.options.resource).toBe(runtimeResource);
    expect(editor.plugin(plugin).getOption('resource')).toBe(runtimeResource);
    expect(Object.isFrozen(published.options.resource)).toBe(false);
  });

  it('snapshots nested plain options away from caller-owned mutation', () => {
    const nested = { label: 'one' };
    const entries = [nested];
    const plugin = createBasePlugin({
      key: 'test',
      options: { entries, nested },
    });
    const editor = createBaseEditor({ plugins: [plugin] });
    const published = getPlateRuntime(editor).plugins.test;
    const listener = vi.fn();
    const unsubscribe = getPluginOptionsStore(
      editor,
      plugin.key
    )!.store.subscribe(listener);

    nested.label = 'mutated';
    entries.push({ label: 'two' });

    expect(published.options.nested).toEqual({ label: 'one' });
    expect(published.options.nested).not.toBe(nested);
    expect(Object.isFrozen(published.options.nested)).toBe(true);
    expect(published.options.entries).toEqual([{ label: 'one' }]);
    expect(published.options.entries).not.toBe(entries);
    expect(published.options.entries[0]).toBe(published.options.nested);
    expect(Object.isFrozen(published.options.entries)).toBe(true);
    expect(editor.plugin(plugin).getOption('nested')).toEqual({ label: 'one' });
    expect(listener).not.toHaveBeenCalled();

    editor.plugin(plugin).setOption('nested', { label: 'updated' });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(editor.plugin(plugin).getOption('nested')).toEqual({
      label: 'updated',
    });
    expect(published.options.nested).toEqual({ label: 'one' });
    unsubscribe();
  });

  it('preserves shared and cyclic identity inside snapshotted plain options', () => {
    const shared = { label: 'shared' };
    const cycle: { self?: typeof cycle } = {};

    cycle.self = cycle;
    const plugin = createBasePlugin({
      key: 'test',
      options: { cycle, first: shared, second: shared },
    });
    const editor = createBaseEditor({ plugins: [plugin] });
    const options = getPlateRuntime(editor).plugins.test.options;

    expect(options.first).toBe(options.second);
    expect(options.first).not.toBe(shared);
    expect(Object.isFrozen(options.first)).toBe(true);
    expect(options.cycle).not.toBe(cycle);
    expect(options.cycle.self).toBe(options.cycle);
    expect(Object.isFrozen(options.cycle)).toBe(true);
  });

  it('rejects accessor properties in plain option graphs', () => {
    const nested = {} as { value: number };

    Object.defineProperty(nested, 'value', {
      get: () => 1,
      set: () => {},
    });
    const plugin = createBasePlugin({
      key: 'test',
      options: { nested },
    });

    expect(() => createBaseEditor({ plugins: [plugin] })).toThrow(
      'Plate plugin options must be data-only. Accessor properties are not supported; use .extendSelectors() for computed values.'
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
      key: 'directForwardRefHost',
    }).withComponent(DirectNode);
    const plugin = createPlatePlugin({ key: 'forwardRefHost' }).configure({
      override: { components: { paragraph: OverrideNode } },
      render: { node: Node },
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

  it('snapshots plugin-valued options as frozen nominal references', () => {
    const Target = createBasePlugin({ key: 'optionTarget' });
    const cycle: { self?: typeof cycle; target: typeof Target } = {
      target: Target,
    };

    cycle.self = cycle;
    const Owner = createBasePlugin({
      key: 'optionOwner',
      options: { cycle, first: Target, second: Target },
    });
    const editor = createBaseEditor({ plugins: [Target, Owner] });
    const publishedOptions =
      getPlateRuntime(editor).plugins.optionOwner.options;
    const targetReference = publishedOptions.first;

    expect(targetReference).toEqual({
      key: 'optionTarget',
      type: 'optionTarget',
    });
    expect(targetReference).toBe(publishedOptions.second);
    expect(targetReference).toBe(publishedOptions.cycle.target);
    expect(publishedOptions.cycle.self).toBe(publishedOptions.cycle);
    expect(targetReference).not.toBe(Target);
    expect(Object.isFrozen(targetReference)).toBe(true);
    expect(editor.plugin(Owner).getOption('first')).toBe(targetReference);

    const ContextOwner = createBasePlugin({
      key: 'contextOptionOwner',
      options: { target: null as unknown as typeof Target },
    }).extend(() => ({ options: { target: Target } }));
    const contextEditor = createBaseEditor({
      plugins: [Target, ContextOwner],
    });
    const contextPublished =
      getPlateRuntime(contextEditor).plugins.contextOptionOwner.options.target;

    expect(contextPublished).toBe(
      contextEditor.plugin(ContextOwner).getOption('target')
    );
    expect(contextPublished).not.toBe(Target);
    expect(contextPublished).not.toBe(targetReference);
    expect(Object.isFrozen(contextPublished)).toBe(true);

    Object.assign(Target, { key: 'mutatedTarget', type: 'mutatedTarget' });

    expect(targetReference).toEqual({
      key: 'optionTarget',
      type: 'optionTarget',
    });
    expect(getPlateRuntime(editor).plugins.optionTarget).toMatchObject({
      key: 'optionTarget',
      type: 'optionTarget',
    });
  });

  it('keeps mutable option state outside the published plugin descriptor', () => {
    const plugin = createBasePlugin({
      key: 'test',
      options: { value: 'original' },
    });

    const editor = createBaseEditor({
      plugins: [plugin],
    });

    editor.plugin(plugin).setOption('value', 'modified');

    expect(editor.plugin(plugin).getOption('value')).toBe('modified');
    expect(getPlateRuntime(editor).plugins.test.options.value).toBe('original');
    expect(plugin.options.value).toBe('original');
  });

  it('keeps extension-derived defaults separate from mutable option state', () => {
    const plugin = createBasePlugin({
      key: 'test',
      options: { value: 'original' },
    }).extend(({ getOptions }) => ({
      options: {
        ...getOptions(),
        value: 'modified',
      },
    }));

    const editor = createBaseEditor({
      plugins: [plugin],
    });

    expect(getPlateRuntime(editor).plugins.test.options.value).toBe('modified');

    editor.plugin(plugin).setOption('value', 'runtime');

    expect(editor.plugin(plugin).getOption('value')).toBe('runtime');
    expect(getPlateRuntime(editor).plugins.test.options.value).toBe('modified');
    expect(plugin.options.value).toBe('original');
  });
});
