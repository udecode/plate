import type { SlateEditor } from '../editor';

import { createPlateEditor } from '../../react';
import { createPlatePlugin } from '../../react/plugin/createPlatePlugin';
import { getPlugin } from '../../react/plugin/getPlugin';
import { createSlatePlugin } from '../plugin';
import { DebugPlugin } from '../plugins';
import { resolvePluginTest } from './resolveCreatePluginTest';
import {
  applyPluginsToEditor,
  resolveAndSortPlugins,
  resolvePluginOverrides,
  resolvePlugins,
} from './resolvePlugins';

describe('resolvePlugins', () => {
  let editor: SlateEditor;

  beforeEach(() => {
    editor = createPlateEditor();
  });

  it('should initialize plugins with correct order based on priority', () => {
    const plugins = [
      createSlatePlugin({ key: 'a', priority: 1 }),
      createSlatePlugin({ key: 'b', priority: 3 }),
      createSlatePlugin({ key: 'c', priority: 2 }),
    ];

    resolvePlugins(editor, plugins);

    expect(editor.pluginList.map((p) => p.key)).toEqual(['b', 'c', 'a']);
  });

  it('should handle nested plugins', () => {
    const plugins = [
      createSlatePlugin({
        key: 'parent',
        plugins: [
          createSlatePlugin({ key: 'child1' }),
          createSlatePlugin({ key: 'child2' }),
        ],
      }),
    ];

    resolvePlugins(editor, plugins);

    expect(editor.pluginList.map((p) => p.key)).toContain('parent');
    expect(editor.pluginList.map((p) => p.key)).toContain('child1');
    expect(editor.pluginList.map((p) => p.key)).toContain('child2');
  });

  it('should not include disabled plugins', () => {
    const plugins = [
      createSlatePlugin({ key: 'enabled' }),
      createSlatePlugin({ enabled: false, key: 'disabled' }),
    ];

    resolvePlugins(editor, plugins);

    expect(editor.pluginList.map((p) => p.key)).toContain('enabled');
    expect(editor.pluginList.map((p) => p.key)).not.toContain('disabled');
  });

  it('should apply overrides correctly', () => {
    const plugins = [
      createSlatePlugin({
        key: 'a',
        node: { type: 'original' },
        override: {
          plugins: {
            b: { node: { type: 'overridden' } },
          },
        },
      }),
      createSlatePlugin({ key: 'b', node: { type: 'original' } }),
    ];

    resolvePlugins(editor, plugins);

    expect(editor.plugins.b.node.type).toBe('overridden');
  });

  it('should merge all plugin APIs into editor.api', () => {
    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          api: { methodA: () => 'A' },
          key: 'plugin1',
        }),
        createSlatePlugin({
          api: { methodB: () => 'B' },
          key: 'plugin2',
        }),
      ],
    });

    expect(editor.api.methodA).toBeDefined();
    expect(editor.api.methodB).toBeDefined();
    expect(editor.api.methodA()).toBe('A');
    expect(editor.api.methodB()).toBe('B');
  });

  it('should overwrite API methods with the same name', () => {
    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin<'plugin1'>({
          api: { method: (_: string) => 'first' },
          key: 'plugin1',
        }),
        createSlatePlugin({
          api: { method: (_: number) => 'second' },
          key: 'plugin2',
        }),
      ],
    });

    expect(editor.api.method(1)).toBe('second');
  });
});

describe('resolveAndSortPlugins', () => {
  it('should resolve and sort plugins correctly', () => {
    const editor = createPlateEditor();
    const plugins = [
      createSlatePlugin({ key: 'a', priority: 1 }),
      createSlatePlugin({ key: 'b', priority: 3 }),
      createSlatePlugin({ key: 'c', priority: 2 }),
    ];

    const result = resolveAndSortPlugins(editor, plugins);

    expect(result.map((p) => p.key)).toEqual(['b', 'c', 'a']);
  });

  it('should handle nested plugins', () => {
    const editor = createPlateEditor();
    const plugins = [
      createSlatePlugin({
        key: 'parent',
        plugins: [
          createSlatePlugin({ key: 'child1', priority: 2 }),
          createSlatePlugin({ key: 'child2', priority: 1 }),
        ],
      }),
    ];

    const result = resolveAndSortPlugins(editor, plugins);

    expect(result.map((p) => p.key)).toEqual(['parent', 'child1', 'child2']);
  });

  it('should order plugins based on dependencies', () => {
    const editor = createPlateEditor();
    const plugins = [
      createSlatePlugin({ key: 'a', priority: 1 }),
      createSlatePlugin({ dependencies: ['c'], key: 'b', priority: 3 }),
      createSlatePlugin({ key: 'c', priority: 2 }),
    ];

    const result = resolveAndSortPlugins(editor, plugins);

    expect(result.map((p) => p.key)).toEqual(['c', 'b', 'a']);
  });

  it('should handle multiple dependencies', () => {
    const editor = createPlateEditor();
    const plugins = [
      createSlatePlugin({ dependencies: ['b', 'c'], key: 'a', priority: 3 }),
      createSlatePlugin({ key: 'b', priority: 2 }),
      createSlatePlugin({ key: 'c', priority: 1 }),
    ];

    const result = resolveAndSortPlugins(editor, plugins);

    expect(result.map((p) => p.key)).toEqual(['b', 'c', 'a']);
  });

  it('should handle nested dependencies', () => {
    const editor = createPlateEditor();
    const plugins = [
      createSlatePlugin({ dependencies: ['b'], key: 'a', priority: 3 }),
      createSlatePlugin({ dependencies: ['c'], key: 'b', priority: 2 }),
      createSlatePlugin({ key: 'c', priority: 1 }),
    ];

    const result = resolveAndSortPlugins(editor, plugins);

    expect(result.map((p) => p.key)).toEqual(['c', 'b', 'a']);
  });

  it('should maintain priority order when no dependencies conflict', () => {
    const editor = createPlateEditor();
    const plugins = [
      createSlatePlugin({ key: 'a', priority: 3 }),
      createSlatePlugin({ dependencies: ['c'], key: 'b', priority: 2 }),
      createSlatePlugin({ key: 'c', priority: 1 }),
    ];

    const result = resolveAndSortPlugins(editor, plugins);

    expect(result.map((p) => p.key)).toEqual(['a', 'c', 'b']);
  });

  it('should handle circular dependencies gracefully', () => {
    const editor = createPlateEditor();
    const plugins = [
      createSlatePlugin({ dependencies: ['b'], key: 'a' }),
      createSlatePlugin({ dependencies: ['a'], key: 'b' }),
    ];

    const result = resolveAndSortPlugins(editor, plugins);

    expect(result.map((p) => p.key)).toContain('a');
    expect(result.map((p) => p.key)).toContain('b');
    expect(result).toHaveLength(2);
  });

  it('should handle dependencies with nested plugins', () => {
    const editor = createPlateEditor();
    const plugins = [
      createSlatePlugin({
        key: 'parent',
        plugins: [
          createSlatePlugin({ dependencies: ['child2'], key: 'child1' }),
          createSlatePlugin({ key: 'child2' }),
        ],
      }),
    ];

    const result = resolveAndSortPlugins(editor, plugins);

    const childIndices = result.map((p) => p.key).slice(1); // Exclude 'parent'
    expect(childIndices).toEqual(['child2', 'child1']);
  });
});

describe('applyPluginsToEditor', () => {
  it('should merge plugins correctly', () => {
    const editor = createPlateEditor();

    const plugins = [
      createSlatePlugin({ key: 'a', node: { type: 'typeA' } }),
      createSlatePlugin({ key: 'b', node: { type: 'typeB' } }),
    ];

    applyPluginsToEditor(editor, plugins);

    expect(editor.pluginList).toHaveLength(2);
    expect(editor.plugins.a.node.type).toBe('typeA');
    expect(editor.plugins.b.node.type).toBe('typeB');
  });

  it('should update existing plugins', () => {
    const editor = createPlateEditor({
      plugins: [createSlatePlugin({ key: 'a', node: { type: 'oldType' } })],
    });

    const plugins = [
      createSlatePlugin({ key: 'a', node: { type: 'newType' } }),
    ];

    applyPluginsToEditor(editor, plugins);

    expect(editor.pluginList).toHaveLength(1);
    expect(editor.plugins.a.node.type).toBe('newType');
  });
});

describe('applyPluginOverrides', () => {
  it('should apply overrides correctly', () => {
    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'a',
          node: { type: 'originalA' },
          override: {
            plugins: {
              b: { node: { type: 'overriddenB' } },
            },
          },
        }),
        createSlatePlugin({ key: 'b', node: { type: 'originalB' } }),
      ],
    });

    resolvePluginOverrides(editor);

    expect(editor.plugins.a.node.type).toBe('originalA');
    expect(editor.plugins.b.node.type).toBe('overriddenB');
  });

  it('should handle nested overrides', () => {
    const editor = createPlateEditor() as SlateEditor;

    resolvePlugins(editor, [
      createSlatePlugin({
        key: 'parent',
        override: {
          plugins: {
            child: { node: { type: 'overriddenChild' } },
          },
        },
        plugins: [
          createSlatePlugin({ key: 'child', node: { type: 'originalChild' } }),
        ],
      }),
    ]);

    expect(editor.plugins.child.node.type).toBe('overriddenChild');
  });

  it('should apply multiple overrides in correct order', () => {
    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'a',
          node: { type: 'originalA' },
          override: {
            plugins: {
              c: { node: { type: 'overriddenByA' } },
            },
          },
        }),
        createSlatePlugin({
          key: 'b',
          node: { type: 'originalB' },
          override: {
            plugins: {
              c: { node: { type: 'overriddenByB' } },
            },
          },
        }),
        createSlatePlugin({ key: 'c', node: { type: 'originalC' } }),
      ],
    });

    resolvePluginOverrides(editor);

    expect(editor.plugins.c.node.type).toBe('overriddenByB');
  });

  it('should override components based on priority only if target plugin has a component', () => {
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
        createSlatePlugin({
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
    it('should correctly apply targetPluginToInject and merge with existing plugins', () => {
      const plugin = createSlatePlugin({
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
          targetPluginToInject: ({ targetPlugin }) => ({
            parsers: {
              html: {
                deserializer: {
                  parse: () => {},
                },
              },
            },
          }),
          targetPlugins: ['plugin1', 'plugin2'],
        },
        key: 'testPlugin',
      });

      const resolvedPlugin = resolvePluginTest(plugin);

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

  it('should replace plugins with the same key and merge their APIs', () => {
    const originalLogger = jest.fn();
    const replacementLogger = jest.fn();

    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          api: { method: originalLogger },
          key: 'a',
        }),
        // This should replace the previous plugin
        createSlatePlugin({
          api: { method: replacementLogger },
          key: 'a',
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

  it('should allow overriding core plugins like DebugPlugin', () => {
    const customLogger = jest.fn();

    const editor = createPlateEditor({
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

  it('should not include plugins disabled through overrides.enabled', () => {
    const editor = createPlateEditor({
      override: {
        enabled: {
          b: false,
        },
      },
      plugins: [
        createSlatePlugin({
          key: 'a',
        }),
        createSlatePlugin({ key: 'b' }),
        createSlatePlugin({ key: 'c' }),
      ],
    });

    resolvePluginOverrides(editor);

    expect(editor.plugins).toHaveProperty('a');
    expect(editor.plugins).not.toHaveProperty('b');
    expect(editor.plugins).toHaveProperty('c');
  });

  it('should not include plugins disabled through overrides.plugins', () => {
    const editor = createPlateEditor({
      override: {
        plugins: {
          b: {
            enabled: false,
          },
        },
      },
      plugins: [
        createSlatePlugin({
          key: 'a',
        }),
        createSlatePlugin({ key: 'b' }),
        createSlatePlugin({ key: 'c' }),
      ],
    });

    resolvePluginOverrides(editor);

    expect(editor.plugins).toHaveProperty('a');
    expect(editor.plugins).not.toHaveProperty('b');
    expect(editor.plugins).toHaveProperty('c');
  });
});

describe('mergePlugins behavior in resolvePlugins', () => {
  it('should not deeply clone options object', () => {
    const nestedOptions = { value: 'original' };
    const plugin = createSlatePlugin({
      key: 'test',
      options: { nested: nestedOptions },
    });

    const editor = createPlateEditor({
      plugins: [plugin],
    });

    // Modify the nested options
    nestedOptions.value = 'modified';

    // Check that the modification is reflected in the resolved plugin's options
    expect(editor.plugins.test.options.nested.value).toBe('modified');
  });

  it('should shallow clone the options object', () => {
    const plugin = createSlatePlugin({
      key: 'test',
      options: { value: 'original' },
    });

    const editor = createPlateEditor({
      plugins: [plugin],
    });

    // Modify the top-level option
    editor.plugins.test.options.value = 'modified';

    // Check that the modification does not affect the original plugin
    expect(plugin.options.value).toBe('original');
  });

  it('should be able to merge options', () => {
    const plugin = createSlatePlugin({
      key: 'test',
      options: { value: 'original' },
    }).extend(({ getOptions }) => ({
      options: {
        ...getOptions(),
        value: 'modified',
      },
    }));

    const editor = createPlateEditor({
      plugins: [plugin],
    });

    // Modify the top-level option
    editor.plugins.test.options.value = 'modified';

    // Check that the modification does not affect the original plugin
    expect(plugin.options.value).toBe('original');
  });
});
