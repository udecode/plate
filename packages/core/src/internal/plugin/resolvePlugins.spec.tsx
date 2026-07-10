import { createBaseEditor } from '../../lib/editor';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';

import { createBasePlugin } from '../../lib/plugin/createBasePlugin';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { createPlateEditor } from '../../react/editor/withPlate';
import { createPlatePlugin } from '../../react/plugin/createPlatePlugin';
import { getPlugin } from '../../react/plugin/getPlugin';
import { resolvePluginTest } from './resolveCreatePluginTest';
import {
  applyPluginsToEditor,
  resolveAndSortPlugins,
  resolvePluginOverrides,
  resolvePlugins,
} from './resolvePlugins';

const getResolvedKeys = (plugins: readonly AnyBasePlugin[]) => {
  const editor = createBaseEditor();

  resolvePlugins(editor, plugins);

  return editor.runtime.pluginList.map((plugin) => plugin.key);
};

const getSortedKeys = (plugins: readonly AnyBasePlugin[]) => {
  const editor = createBaseEditor();

  return resolveAndSortPlugins(editor, plugins).map((plugin) => plugin.key);
};

describe('resolvePlugins', () => {
  it('initialize plugins with correct order based on priority', () => {
    expect(
      getResolvedKeys([
        createBasePlugin({ key: 'a', priority: 1 }),
        createBasePlugin({ key: 'b', priority: 3 }),
        createBasePlugin({ key: 'c', priority: 2 }),
      ])
    ).toEqual(['b', 'c', 'a']);
  });

  it('handle nested plugins', () => {
    const pluginKeys = getResolvedKeys([
      createBasePlugin({
        key: 'parent',
        plugins: [
          createBasePlugin({ key: 'child1' }),
          createBasePlugin({ key: 'child2' }),
        ],
      }),
    ]);

    expect(pluginKeys).toContain('parent');
    expect(pluginKeys).toContain('child1');
    expect(pluginKeys).toContain('child2');
  });

  it('does not include disabled plugins', () => {
    const pluginKeys = getResolvedKeys([
      createBasePlugin({ key: 'enabled' }),
      createBasePlugin({ key: 'disabled', enabled: false }),
    ]);

    expect(pluginKeys).toContain('enabled');
    expect(pluginKeys).not.toContain('disabled');
  });

  it('apply overrides correctly', () => {
    const editor = createBaseEditor();
    const plugins = [
      createBasePlugin({
        key: 'a',
        node: { type: 'original' },
        override: {
          plugins: {
            b: { node: { type: 'overridden' } },
          },
        },
      }),
      createBasePlugin({ key: 'b', node: { type: 'original' } }),
    ];

    resolvePlugins(editor, plugins);

    expect(editor.plugins.b.node.type).toBe('overridden');
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
        createBasePlugin({
          key: 'cachey',
          decorate: () => [],
          handlers: {
            onChange: () => {},
            onNodeChange: () => {},
            onTextChange: () => {},
          },
          node: {
            isDecoration: false,
            isLeaf: true,
            leafProps: { 'data-leaf': 'x' } as any,
            textProps: { 'data-text': 'y' } as any,
            type: 'cachey',
          },
          transformInitialValue: () => [],
          render: {
            aboveEditable: () => null,
            aboveNodes: () => null,
            abovePlite: () => null,
            afterContainer: () => null,
            afterEditable: () => null,
            beforeContainer: () => null,
            beforeEditable: () => null,
            belowNodes: () => null,
            belowRootNodes: () => null,
          },
          rules: {
            match: () => true,
          },
        }) as any,
      ],
    });

    (editor.plugins.cachey as any).useHooks = () => {};
    resolvePlugins(editor, [editor.plugins.cachey as any]);

    expect(editor.runtime.pluginCache.decorate).toContain('cachey');
    expect(editor.runtime.pluginCache.handlers.onChange).toContain('cachey');
    expect(editor.runtime.pluginCache.handlers.onNodeChange).toContain(
      'cachey'
    );
    expect(editor.runtime.pluginCache.handlers.onTextChange).toContain(
      'cachey'
    );
    expect(editor.runtime.pluginCache.node.isText).toContain('cachey');
    expect(editor.runtime.pluginCache.node.leafProps).toContain('cachey');
    expect(editor.runtime.pluginCache.node.textProps).toContain('cachey');
    expect(editor.runtime.pluginCache.transformInitialValue).toContain(
      'cachey'
    );
    expect(editor.runtime.pluginCache.render.aboveEditable).toContain('cachey');
    expect(editor.runtime.pluginCache.render.aboveNodes).toContain('cachey');
    expect(editor.runtime.pluginCache.render.abovePlite).toContain('cachey');
    expect(editor.runtime.pluginCache.render.afterContainer).toContain(
      'cachey'
    );
    expect(editor.runtime.pluginCache.render.afterEditable).toContain('cachey');
    expect(editor.runtime.pluginCache.render.beforeContainer).toContain(
      'cachey'
    );
    expect(editor.runtime.pluginCache.render.beforeEditable).toContain(
      'cachey'
    );
    expect(editor.runtime.pluginCache.render.belowNodes).toContain('cachey');
    expect(editor.runtime.pluginCache.render.belowRootNodes).toContain(
      'cachey'
    );
    expect(editor.runtime.pluginCache.rules.match).toContain('cachey');
    expect(editor.runtime.pluginCache.useHooks).toContain('cachey');
  });

  it('creates a shortcut handler from plugin-specific tx commands', () => {
    const toggle = mock();
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'shortcutTx',
          shortcuts: {
            toggle: { keys: 'mod+k' },
          },
        }).extendTx(() => () => ({ toggle })),
      ],
    });

    editor.runtime.shortcuts['shortcutTx.toggle']?.handler?.({} as any);

    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('falls back to plugin-specific api when tx has no matching shortcut command', () => {
    const other = mock();
    const toggle = mock() as any;
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'shortcutMixed',
          shortcuts: {
            toggle: { keys: 'mod+k' },
          },
        })
          .extendTx(() => () => ({ other }))
          .extendApi(() => ({ toggle })),
      ],
    });

    editor.runtime.shortcuts['shortcutMixed.toggle']?.handler?.({} as any);

    expect(other).not.toHaveBeenCalled();
    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('does not prevent default when no matching tx or api shortcut command exists', () => {
    const other = mock();
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'shortcutMissing',
          shortcuts: {
            toggle: { keys: 'mod+k' },
          },
        }).extendTx(() => () => ({ other })),
      ],
    });

    const result = editor.runtime.shortcuts[
      'shortcutMissing.toggle'
    ]?.handler?.({} as any);

    expect(other).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('does not prevent default when a tx shortcut command returns false', () => {
    const untab = mock(() => false);
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'shortcutTxFalse',
          shortcuts: {
            untab: { keys: 'shift+tab' },
          },
        }).extendTx(() => () => ({ untab })),
      ],
    });

    const result = editor.runtime.shortcuts['shortcutTxFalse.untab']?.handler?.(
      {} as any
    );

    expect(untab).toHaveBeenCalledTimes(1);
    expect(result).toBe(false);
  });

  it('does not treat foreign tx groups as plugin shortcut commands', () => {
    const replace = mock();
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'shortcutForeign',
          shortcuts: {
            replace: { keys: 'mod+k' },
          },
        }).extendTxGroup('foreignTx', () => () => ({ replace })),
      ],
    });

    expect(editor.runtime.shortcuts['shortcutForeign.replace']?.handler).toBe(
      undefined
    );
  });

  it('creates a shortcut handler from plugin-specific api methods', () => {
    const toggle = mock();
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'shortcutApi',
          shortcuts: {
            toggle: { keys: 'mod+k' },
          },
        }).extendApi(() => ({
          toggle,
        })),
      ],
    });

    editor.runtime.shortcuts['shortcutApi.toggle']?.handler?.({} as any);

    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('cleans plugin api extensions before resolving a new plugin set on the same editor', () => {
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'pluginApi',
        }).extendApi(() => ({
          run: () => 'run',
        })),
      ],
    });

    expect(editor.plugins.pluginApi.api).toHaveProperty('pluginApi.run');

    resolvePlugins(editor, []);

    expect(editor.plugins.pluginApi).toBeUndefined();
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
    ).toThrow('inputRules config must be an array of explicit rule instances.');
  });
});

describe('resolveAndSortPlugins', () => {
  it.each([
    {
      expected: ['b', 'c', 'a'],
      name: 'resolve and sort plugins correctly',
      plugins: () => [
        createBasePlugin({ key: 'a', priority: 1 }),
        createBasePlugin({ key: 'b', priority: 3 }),
        createBasePlugin({ key: 'c', priority: 2 }),
      ],
    },
    {
      expected: ['parent', 'child1', 'child2'],
      name: 'handle nested plugins',
      plugins: () => [
        createBasePlugin({
          key: 'parent',
          plugins: [
            createBasePlugin({ key: 'child1', priority: 2 }),
            createBasePlugin({ key: 'child2', priority: 1 }),
          ],
        }),
      ],
    },
    {
      expected: ['c', 'b', 'a'],
      name: 'order plugins based on dependencies',
      plugins: () => [
        createBasePlugin({ key: 'a', priority: 1 }),
        createBasePlugin({ key: 'b', dependencies: ['c'], priority: 3 }),
        createBasePlugin({ key: 'c', priority: 2 }),
      ],
    },
    {
      expected: ['b', 'c', 'a'],
      name: 'handle multiple dependencies',
      plugins: () => [
        createBasePlugin({ key: 'a', dependencies: ['b', 'c'], priority: 3 }),
        createBasePlugin({ key: 'b', priority: 2 }),
        createBasePlugin({ key: 'c', priority: 1 }),
      ],
    },
    {
      expected: ['c', 'b', 'a'],
      name: 'handle nested dependencies',
      plugins: () => [
        createBasePlugin({ key: 'a', dependencies: ['b'], priority: 3 }),
        createBasePlugin({ key: 'b', dependencies: ['c'], priority: 2 }),
        createBasePlugin({ key: 'c', priority: 1 }),
      ],
    },
    {
      expected: ['a', 'c', 'b'],
      name: 'maintain priority order when no dependencies conflict',
      plugins: () => [
        createBasePlugin({ key: 'a', priority: 3 }),
        createBasePlugin({ key: 'b', dependencies: ['c'], priority: 2 }),
        createBasePlugin({ key: 'c', priority: 1 }),
      ],
    },
    {
      expected: ['parent', 'child2', 'child1'],
      name: 'handle dependencies with nested plugins',
      plugins: () => [
        createBasePlugin({
          key: 'parent',
          plugins: [
            createBasePlugin({ key: 'child1', dependencies: ['child2'] }),
            createBasePlugin({ key: 'child2' }),
          ],
        }),
      ],
    },
  ])('$name', ({ expected, plugins }) => {
    expect(getSortedKeys(plugins())).toEqual(expected);
  });

  it('handle circular dependencies gracefully', () => {
    const pluginKeys = getSortedKeys([
      createBasePlugin({ key: 'a', dependencies: ['b'] }),
      createBasePlugin({ key: 'b', dependencies: ['a'] }),
    ]);

    expect(pluginKeys).toContain('a');
    expect(pluginKeys).toContain('b');
    expect(pluginKeys).toHaveLength(2);
  });

  it('warns when a dependency is missing', () => {
    const warnLogger = mock();
    const editor = createBaseEditor({
      plugins: [
        DebugPlugin.configure({
          options: {
            logger: { warn: warnLogger } as any,
            throwErrors: false,
          },
        }),
      ],
    });

    resolveAndSortPlugins(editor, [
      createBasePlugin({
        key: 'dependent',
        dependencies: ['missing'],
      }),
    ]);

    expect(warnLogger).toHaveBeenCalledWith(
      'Plugin "dependent" depends on missing plugin "missing"',
      'PLUGIN_DEPENDENCY_MISSING',
      undefined
    );
  });
});

describe('applyPluginsToEditor', () => {
  it('merge plugins correctly', () => {
    const editor = createBaseEditor();

    const plugins = [
      createBasePlugin({ key: 'a', node: { type: 'typeA' } }),
      createBasePlugin({ key: 'b', node: { type: 'typeB' } }),
    ];

    applyPluginsToEditor(editor, plugins);

    expect(editor.runtime.pluginList).toHaveLength(2);
    expect(editor.plugins.a.node.type).toBe('typeA');
    expect(editor.plugins.b.node.type).toBe('typeB');
  });

  it('update existing plugins', () => {
    const editor = createBaseEditor({
      plugins: [createBasePlugin({ key: 'a', node: { type: 'oldType' } })],
    });

    const plugins = [createBasePlugin({ key: 'a', node: { type: 'newType' } })];

    applyPluginsToEditor(editor, plugins);

    expect(editor.runtime.pluginList).toHaveLength(1);
    expect(editor.plugins.a.node.type).toBe('newType');
  });
});

describe('applyPluginOverrides', () => {
  it('apply overrides correctly', () => {
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'a',
          node: { type: 'originalA' },
          override: {
            plugins: {
              b: { node: { type: 'overriddenB' } },
            },
          },
        }),
        createBasePlugin({ key: 'b', node: { type: 'originalB' } }),
      ],
    });

    resolvePluginOverrides(editor);

    expect(editor.plugins.a.node.type).toBe('originalA');
    expect(editor.plugins.b.node.type).toBe('overriddenB');
  });

  it('handle nested overrides', () => {
    const editor = createBaseEditor();

    resolvePlugins(editor, [
      createBasePlugin({
        key: 'parent',
        override: {
          plugins: {
            child: { node: { type: 'overriddenChild' } },
          },
        },
        plugins: [
          createBasePlugin({ key: 'child', node: { type: 'originalChild' } }),
        ],
      }),
    ]);

    expect(editor.plugins.child.node.type).toBe('overriddenChild');
  });

  it('apply multiple overrides in correct order', () => {
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'a',
          node: { type: 'originalA' },
          override: {
            plugins: {
              c: { node: { type: 'overriddenByA' } },
            },
          },
        }),
        createBasePlugin({
          key: 'b',
          node: { type: 'originalB' },
          override: {
            plugins: {
              c: { node: { type: 'overriddenByB' } },
            },
          },
        }),
        createBasePlugin({ key: 'c', node: { type: 'originalC' } }),
      ],
    });

    resolvePluginOverrides(editor);

    expect(editor.plugins.c.node.type).toBe('overriddenByB');
  });

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

    resolvePluginOverrides(editor);

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

  describe('targetPlugins', () => {
    it('correctly apply targetPluginToInject and merge with existing plugins', () => {
      const resolvedPlugin = resolvePluginTest(
        createBasePlugin({
          key: 'testPlugin',
          inject: {
            plugins: {
              plugin1: {
                parsers: {
                  html: {
                    deserializer: {
                      parse: () => {},
                    },
                  },
                },
              },
              plugin3: {
                parsers: {
                  html: {
                    deserializer: {
                      parse: () => {},
                    },
                  },
                },
              },
            },
            targetPlugins: ['plugin1', 'plugin2'],
            targetPluginToInject: ({ targetPlugin: _targetPlugin }) => ({
              parsers: {
                html: {
                  deserializer: {
                    parse: () => {},
                  },
                },
              },
            }),
          },
        })
      );

      expect(resolvedPlugin.inject?.plugins).toBeDefined();
      expect(Object.keys(resolvedPlugin.inject!.plugins!)).toEqual([
        'plugin1',
        'plugin3',
        'plugin2',
      ]);

      // Check merged result for plugin1
      expect(resolvedPlugin.inject!.plugins!.plugin1).toHaveProperty(
        'parsers.html.deserializer.parse'
      );
      expect(
        resolvedPlugin.inject!.plugins!.plugin1.parsers?.html?.deserializer!
          .parse
      ).toBeDefined();

      // Check injected result for plugin2
      expect(resolvedPlugin.inject!.plugins!.plugin2).toHaveProperty(
        'parsers.html.deserializer.parse'
      );
      expect(
        resolvedPlugin.inject!.plugins!.plugin2.parsers?.html?.deserializer!
          .parse
      ).toBeDefined();

      // Check existing result for plugin3 is preserved
      expect(resolvedPlugin.inject!.plugins!.plugin3).toHaveProperty(
        'parsers.html.deserializer.parse'
      );
      expect(
        resolvedPlugin.inject!.plugins!.plugin3.parsers?.html?.deserializer!
          .parse
      ).toBeDefined();
    });
  });

  it('replace plugins with the same key and merge their APIs', () => {
    const originalLogger = mock();
    const replacementLogger = mock();

    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'a',
          api: { method: originalLogger },
        }),
        // This should replace the previous plugin
        createBasePlugin({
          key: 'a',
          api: { method: replacementLogger },
        }),
      ],
    });

    editor.api.method({
      level: 'debug',
      message: 'Test message',
      type: 'TEST',
    });

    expect(originalLogger).not.toHaveBeenCalled();
    expect(replacementLogger).toHaveBeenCalledWith({
      level: 'debug',
      message: 'Test message',
      type: 'TEST',
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

  it.each([
    {
      name: 'overrides.enabled',
      override: {
        enabled: {
          b: false,
        },
      },
    },
    {
      name: 'overrides.plugins',
      override: {
        plugins: {
          b: {
            enabled: false,
          },
        },
      },
    },
  ])('does not include plugins disabled through $name', ({ override }) => {
    const editor = createBaseEditor({
      override,
      plugins: [
        createBasePlugin({ key: 'a' }),
        createBasePlugin({ key: 'b' }),
        createBasePlugin({ key: 'c' }),
      ],
    });

    resolvePluginOverrides(editor);

    expect(editor.plugins).toHaveProperty('a');
    expect(editor.plugins).not.toHaveProperty('b');
    expect(editor.plugins).toHaveProperty('c');
  });
});

describe('mergePlugins behavior in resolvePlugins', () => {
  it('does not deeply clone options object', () => {
    const nestedOptions = { value: 'original' };
    const plugin = createBasePlugin({
      key: 'test',
      options: { nested: nestedOptions },
    });

    const editor = createBaseEditor({
      plugins: [plugin],
    });

    // Modify the nested options
    nestedOptions.value = 'modified';

    // Check that the modification is reflected in the resolved plugin's options
    expect(editor.plugins.test.options.nested.value).toBe('modified');
  });

  it('shallow clone the options object', () => {
    const plugin = createBasePlugin({
      key: 'test',
      options: { value: 'original' },
    });

    const editor = createBaseEditor({
      plugins: [plugin],
    });

    // Modify the top-level option
    editor.plugins.test.options.value = 'modified';

    // Check that the modification does not affect the original plugin
    expect(plugin.options.value).toBe('original');
  });

  it('merges options from plugin extensions', () => {
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

    // Modify the top-level option
    editor.plugins.test.options.value = 'modified';

    // Check that the modification does not affect the original plugin
    expect(plugin.options.value).toBe('original');
  });
});

describe('resolvePlugins with keyless plugins', () => {
  it('does not add a plugin without a key to the editor', () => {
    const editor = createBaseEditor();
    const plugins = [
      createBasePlugin({ node: { type: 'no-key-plugin' } } as any), // Simulate a plugin without a key
      createBasePlugin({ key: 'keyedPlugin', node: { type: 'keyed-type' } }),
    ];

    resolvePlugins(editor, plugins as any);

    expect(editor.runtime.pluginList.map((p) => p.key)).not.toContain('');
    expect(editor.plugins.keyedPlugin).toBeDefined();
    expect(editor.runtime.pluginList.some((p) => p.key === 'keyedPlugin')).toBe(
      true
    );
    // Exact count depends on core plugins, but it should contain keyedPlugin and not the keyless one.
  });

  it('process child plugins of a keyless plugin', () => {
    const editor = createBaseEditor();
    const plugins = [
      createBasePlugin({
        // No key for the parent
        node: { type: 'parent-no-key' },
        plugins: [
          createBasePlugin({
            key: 'childKey1',
            node: { type: 'child1-type' },
            priority: 2,
          }),
          createBasePlugin({
            key: 'childKey2',
            node: { type: 'child2-type' },
            priority: 1,
          }),
        ],
      } as any),
      createBasePlugin({
        key: 'anotherPlugin',
        node: { type: 'another-type' },
        priority: 3,
      }),
    ];

    resolvePlugins(editor, plugins as any);

    expect(editor.plugins['parent-no-key']).toBeUndefined();
    expect(editor.plugins.childKey1).toBeDefined();
    expect(editor.plugins.childKey2).toBeDefined();
    expect(editor.plugins.anotherPlugin).toBeDefined();

    const pluginKeys = editor.runtime.pluginList.map((p) => p.key);
    expect(pluginKeys).toContain('childKey1');
    expect(pluginKeys).toContain('childKey2');
    expect(pluginKeys).toContain('anotherPlugin');
  });
});
