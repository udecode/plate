import { definePropertyPolicy, property } from '@platejs/plite';
import { createBaseEditor } from '../../lib/editor';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';

import { createBasePlugin } from '../../lib/plugin/createBasePlugin';
import { DebugPlugin } from '../../lib/plugins/debug/DebugPlugin';
import { createPlateEditor } from '../../react/editor/withPlate';
import { createPlatePlugin } from '../../react/plugin/createPlatePlugin';
import { getPlugin } from '../../react/plugin/getPlugin';
import { resolvePluginTest } from './resolveCreatePluginTest';
import {
  isEquivalentPlatePluginConfig,
  resolveAndSortPlugins,
  resolvePlugins,
} from './resolvePlugins';

const getSortedKeys = (plugins: readonly AnyBasePlugin[]) => {
  const editor = createBaseEditor();

  return resolveAndSortPlugins(editor, plugins).map((plugin) => plugin.key);
};

describe('resolvePlugins', () => {
  it('compares nominal schema tokens by identity', () => {
    const first = definePropertyPolicy({
      id: 'identity-policy',
      validate: (value): value is string => typeof value === 'string',
      version: 1,
    });
    const second = definePropertyPolicy({
      id: 'identity-policy',
      validate: (value): value is string => typeof value === 'string',
      version: 1,
    });

    expect(
      isEquivalentPlatePluginConfig({ policy: first }, { policy: first })
    ).toBe(true);
    expect(
      isEquivalentPlatePluginConfig({ policy: first }, { policy: second })
    ).toBe(false);
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

  it('handle nested plugins', () => {
    const pluginKeys = getSortedKeys([
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
    const pluginKeys = getSortedKeys([
      createBasePlugin({ key: 'enabled' }),
      createBasePlugin({ key: 'disabled', enabled: false }),
    ]);

    expect(pluginKeys).toContain('enabled');
    expect(pluginKeys).not.toContain('disabled');
  });

  it('apply overrides correctly', () => {
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'a',
          type: 'original',
          override: {
            plugins: {
              b: { type: 'overridden' },
            },
          },
        }),
        createBasePlugin({ key: 'b', type: 'original' }),
      ],
    });

    expect(editor.plugins.b.type).toBe('overridden');
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
        Object.assign(
          createPlatePlugin({
            key: 'cachey',
            decorate: () => [],
            handlers: {
              onChange: () => {},
              onNodeChange: () => {},
              onTextChange: () => {},
            },
            type: 'cachey',
            schema: {
              mark: property.boolean({ default: false, omitDefault: true }),
            },
            transformInitialValue: () => [],
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

    expect(editor.runtime.pluginCache.decorate).toContain('cachey');
    expect(editor.runtime.pluginCache.handlers.onChange).toContain('cachey');
    expect(editor.runtime.pluginCache.handlers.onNodeChange).toContain(
      'cachey'
    );
    expect(editor.runtime.pluginCache.handlers.onTextChange).toContain(
      'cachey'
    );
    expect(editor.runtime.pluginCache.node.textMarks).toContain('cachey');
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

    expect(editor.api.pluginApi.run()).toBe('run');

    expect(() => resolvePlugins(editor, [])).toThrow(
      'Plate plugins are immutable after model publication.'
    );
    expect(editor.api.pluginApi.run()).toBe('run');
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

  it('rejects a disabled required dependency after overrides', () => {
    const dependency = createBasePlugin({ key: 'dependency' });
    const dependent = createBasePlugin({
      dependencies: [dependency],
      key: 'dependent',
      override: { enabled: { dependency: false } },
    });

    expect(() => getSortedKeys([dependent])).toThrow(
      'Plugin "dependent" depends on disabled plugin "dependency"'
    );
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
      'Pass the plugin object, not its key.'
    );
  });
});

describe('applyPluginOverrides', () => {
  it('apply overrides correctly', () => {
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'a',
          type: 'originalA',
          override: {
            plugins: {
              b: { type: 'overriddenB' },
            },
          },
        }),
        createBasePlugin({ key: 'b', type: 'originalB' }),
      ],
    });

    expect(editor.plugins.a.type).toBe('originalA');
    expect(editor.plugins.b.type).toBe('overriddenB');
  });

  it('handle nested overrides', () => {
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'parent',
          override: {
            plugins: {
              child: { type: 'overriddenChild' },
            },
          },
          plugins: [createBasePlugin({ key: 'child', type: 'originalChild' })],
        }),
      ],
    });

    expect(editor.plugins.child.type).toBe('overriddenChild');
  });

  it('apply multiple overrides in correct order', () => {
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'a',
          type: 'originalA',
          override: {
            plugins: {
              c: { type: 'overriddenByA' },
            },
          },
        }),
        createBasePlugin({
          key: 'b',
          type: 'originalB',
          override: {
            plugins: {
              c: { type: 'overriddenByB' },
            },
          },
        }),
        createBasePlugin({ key: 'c', type: 'originalC' }),
      ],
    });

    expect(editor.plugins.c.type).toBe('overriddenByB');
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

  describe('targetPluginKeys', () => {
    it('correctly apply targetPluginToInject and merge with existing plugins', () => {
      const resolvedPlugin = resolvePluginTest(
        createBasePlugin({
          config: { targetPluginKeys: ['plugin1', 'plugin2'] },
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

    expect(editor.plugins).toHaveProperty('a');
    expect(editor.plugins).not.toHaveProperty('b');
    expect(editor.plugins).toHaveProperty('c');
  });
});

describe('mergePlugins behavior in resolvePlugins', () => {
  it('freezes the options record without cloning runtime resources', () => {
    const runtimeResource = { value: 'original' };
    const plugin = createBasePlugin({
      config: { nested: { value: 'immutable' } },
      key: 'test',
      options: { resource: runtimeResource },
    });

    const editor = createBaseEditor({
      plugins: [plugin],
    });

    const published = editor.plugins.test;

    expect(published.options).not.toBe(plugin.options);
    expect(Object.isFrozen(published.options)).toBe(true);
    expect(published.options.resource).toBe(runtimeResource);
    expect(editor.plugin(plugin).getOption('resource')).toBe(runtimeResource);
    expect(Object.isFrozen(published.options.resource)).toBe(false);
    expect(Object.isFrozen(published.config)).toBe(true);
    expect(Object.isFrozen(published.config.nested)).toBe(true);
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
    expect(editor.plugins.test.options.value).toBe('original');
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

    expect(editor.plugins.test.options.value).toBe('modified');

    editor.plugin(plugin).setOption('value', 'runtime');

    expect(editor.plugin(plugin).getOption('value')).toBe('runtime');
    expect(editor.plugins.test.options.value).toBe('modified');
    expect(plugin.options.value).toBe('original');
  });
});

describe('resolvePlugins with keyless plugins', () => {
  it('does not add a plugin without a key to the editor', () => {
    const plugins = [
      createBasePlugin({ type: 'no-key-plugin' } as any), // Simulate a plugin without a key
      createBasePlugin({ key: 'keyedPlugin', type: 'keyed-type' }),
    ];
    const editor = createBaseEditor({
      plugins: plugins as any,
    });

    expect(editor.runtime.pluginList.map((p) => p.key)).not.toContain('');
    expect(editor.plugins.keyedPlugin).toBeDefined();
    expect(editor.runtime.pluginList.some((p) => p.key === 'keyedPlugin')).toBe(
      true
    );
    // Exact count depends on core plugins, but it should contain keyedPlugin and not the keyless one.
  });

  it('process child plugins of a keyless plugin', () => {
    const plugins = [
      createBasePlugin({
        // No key for the parent
        type: 'parent-no-key',
        plugins: [
          createBasePlugin({
            key: 'childKey1',
            type: 'child1-type',
            priority: 2,
          }),
          createBasePlugin({
            key: 'childKey2',
            type: 'child2-type',
            priority: 1,
          }),
        ],
      } as any),
      createBasePlugin({
        key: 'anotherPlugin',
        type: 'another-type',
        priority: 3,
      }),
    ];
    const editor = createBaseEditor({
      plugins: plugins as any,
    });

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
