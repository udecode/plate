import {
  defineEditorExtension,
  definePropertyPolicy,
  property,
  schema,
  target,
} from '@platejs/plite';

import {
  resolveCreatePluginTest,
  resolvePluginTest,
} from '../../internal/plugin/resolveCreatePluginTest';
import {
  type AnyBasePlugin,
  type PluginConfig,
  createBaseEditor,
  createBasePlugin,
  prepareParserPluginContext,
} from '../index';
import { getEditorPlugin } from './getEditorPlugin';

const resolveEditorExtensions = (plugin: AnyBasePlugin) => {
  const editor = createBaseEditor({ plugins: [plugin] });
  const resolvedPlugin = editor.getPlugin(plugin);
  const context = getEditorPlugin(editor, resolvedPlugin);

  return resolvedPlugin.__editorExtensions.flatMap((extension) => {
    const input = extension(context);

    if (!input) return [];

    return Array.isArray(input) ? input : [input];
  });
};

describe('createBasePlugin', () => {
  it('preserves immutable property policies through plugin resolution', () => {
    const policy = definePropertyPolicy<number>({
      id: 'plate.test.positive',
      validate: (value): value is number =>
        typeof value === 'number' && value > 0,
      version: 1,
    });
    const width = property.number({ policy });
    const plugin = resolvePluginTest(
      createBasePlugin({
        key: 'policy-node',
        node: {
          element: {
            properties: {
              width,
            },
          },
        },
      })
    );

    const resolvedPolicy = plugin.node.element?.properties?.width.policy;

    expect(resolvedPolicy).toBe(width.policy);
    expect(typeof resolvedPolicy?.validate).toBe('function');
    expect(resolvedPolicy?.validate(1)).toBe(true);
    expect(resolvedPolicy?.validate(-1)).toBe(false);
  });

  it('contextually types explicit node schema declarations', () => {
    type Config = PluginConfig<
      'typed-node-schema',
      { targetPluginKeys: string[] }
    >;

    const plugin = createBasePlugin<Config>({
      key: 'typed-node-schema',
      options: { targetPluginKeys: ['p'] },
      schema: ({ key, options, type }) => ({
        properties: [
          schema.elementProperty(
            schema.key.prefix(`${key}:${type}:`),
            property.json(),
            { target: target.types(options.targetPluginKeys) }
          ),
        ],
      }),
    });
    const editor = createBaseEditor({ plugins: [plugin] });

    expect(() =>
      editor.read.schema.validateFragment([
        {
          children: [{ text: '' }],
          'typed-node-schema:typed-node-schema:value': 1,
          type: 'p',
        },
      ])
    ).not.toThrow();
  });

  describe('extend', () => {
    it('keeps the original key while merging object config', () => {
      const plugin = resolvePluginTest(
        createBasePlugin({ key: 'a', node: { type: 'a' } }).extend({
          inject: {
            nodeProps: {
              nodeKey: 'b',
            },
          },
          node: { type: 'b' },
          options: {
            enabled: true,
          },
        })
      );

      expect({
        inject: plugin.inject,
        key: plugin.key,
        type: plugin.node.type,
      }).toEqual({
        inject: {
          nodeProps: {
            nodeKey: 'b',
          },
        },
        key: 'a',
        type: 'b',
      });
    });

    it('resolves function-based plugins against the editor context', () => {
      const plugin = resolveCreatePluginTest((editor) => ({
        key: 'functionPlugin',
        node: { type: 'function' },
        options: { editorId: editor.id },
      }));

      expect(plugin.key).toBe('functionPlugin');
      expect(plugin.node.type).toBe('function');
      expect(plugin.options).toHaveProperty('editorId');
    });

    it('lets the last extend win for overlapping fields', () => {
      const plugin = resolvePluginTest(
        createBasePlugin({
          key: 'a',
          node: { type: 'a' },
          options: { first: true },
        })
          .extend({
            inject: { nodeProps: { nodeKey: 'b' } },
            node: { type: 'b' },
            options: { second: true },
          })
          .extend({
            inject: { nodeProps: { nodeKey: 'c' } },
            options: { third: true },
          })
      );

      expect(plugin.inject).toEqual({
        nodeProps: {
          nodeKey: 'c',
        },
      });
      expect(plugin.node.type).toBe('b');
      expect(plugin.options).toEqual({
        first: true,
        second: true,
        third: true,
      });
    });

    it('can extend nested plugins', () => {
      const editor = createBaseEditor({
        plugins: [
          createBasePlugin({
            key: 'blocks',
            plugins: [
              createBasePlugin({
                key: 'heading',
                node: { type: 'heading' },
                options: {
                  levels: 6,
                },
              }),
            ],
          }).extendPlugin(
            { key: 'heading' },
            {
              node: { type: 'h' },
              options: {
                levels: 5,
              },
            }
          ),
        ],
      });

      expect(editor.plugins.heading).toMatchObject({
        node: { type: 'h' },
        options: { levels: 5 },
      });
    });

    it('uses the child plugin context when extending nested plugins', () => {
      const childPlugin = createBasePlugin({
        key: 'child',
        options: { childOption: 'child' },
      }).extendEditorApi(() => ({
        method: () => 'child',
      }));

      const parentPlugin = createBasePlugin({
        key: 'parent',
        options: { parentOption: 'parent' },
        plugins: [childPlugin],
      });

      const extendedPlugin = parentPlugin.extendPlugin(childPlugin, (ctx) => ({
        options: {
          extendedOption: `extended ${ctx.plugin.options.childOption}`,
        },
      }));

      const editor = createBaseEditor({
        plugins: [extendedPlugin],
      });

      expect(editor.plugin(childPlugin).getOptions()).toEqual({
        childOption: 'child',
        extendedOption: 'extended child',
      });
      expect(editor.plugin(childPlugin).getOptions()).not.toHaveProperty(
        'parentOption'
      );
    });

    it('can add missing nested plugins and update them later', () => {
      const editor = createBaseEditor({
        plugins: [
          createBasePlugin({
            key: 'a',
            node: { type: 'a' },
            plugins: [
              createBasePlugin({
                key: 'aa',
                node: { type: 'aa' },
              }),
            ],
          })
            .extendPlugin(
              { key: 'bb' },
              {
                node: { type: 'bb' },
              }
            )
            .extendPlugin(
              { key: 'aa' },
              {
                node: { type: 'aa1' },
              }
            )
            .extendPlugin(
              { key: 'bb' },
              {
                node: { type: 'bb1' },
              }
            ),
        ],
      });

      expect(editor.getPlugin({ key: 'aa' }).node.type).toBe('aa1');
      expect(editor.getPlugin({ key: 'bb' }).node.type).toBe('bb1');
    });

    it('infers tx groups in later plugin extension contexts', () => {
      createBasePlugin({ key: 'txPlugin' })
        .extendTx(() => () => ({
          replace: (text: string) => text.length,
        }))
        .extend(({ editor, plugin }) => {
          const replace = (text: string) =>
            editor.update((tx) => {
              const length = tx[plugin.key].replace(text);

              return length satisfies number;
            });

          replace('ok');

          return {};
        });

      expect(1).toBe(1);
    });

    it('infers explicit tx groups in later plugin extension contexts', () => {
      createBasePlugin({ key: 'sourcePlugin' })
        .extendTxGroup('foreignTx', () => () => ({
          replace: (text: string) => text.length,
        }))
        .extend(({ editor }) => {
          const replace = (text: string) => {
            return editor.update((tx) => {
              // @ts-expect-error Explicit tx groups should not install an own-key tx group.
              const sourcePlugin = tx.sourcePlugin;

              const length = tx.foreignTx.replace(text);

              expect(sourcePlugin).toBeUndefined();

              return length satisfies number;
            });
          };

          replace('ok');

          return {};
        });

      expect(1).toBe(1);
    });

    it('adds editor extensions with plugin-derived names', () => {
      const resolved = resolvePluginTest(
        createBasePlugin({
          key: 'runtime',
        }).extendExtension({
          api: {
            runtime: { ping: () => true },
          },
        })
      );

      expect(resolveEditorExtensions(resolved)).toMatchObject([
        {
          name: 'runtime',
        },
      ]);
    });

    it('adds function-returned editor extension options with plugin-derived names', () => {
      const resolved = resolvePluginTest(
        createBasePlugin({
          key: 'runtime',
        }).extendExtension(({ plugin }) => ({
          api: {
            runtime: {
              key: () => plugin.key,
            },
          },
        }))
      );

      expect(resolveEditorExtensions(resolved)).toMatchObject([
        {
          name: 'runtime',
        },
      ]);

      const editor = createBaseEditor({ plugins: [resolved] });

      expect(editor.api.runtime.key()).toBe('runtime');
    });

    it('keeps built editor extension names', () => {
      const resolved = resolvePluginTest(
        createBasePlugin({
          key: 'runtime',
        }).extendExtension(
          defineEditorExtension({
            name: 'explicit',
            api: {
              explicit: {
                ping: () => 'pong' as const,
              },
            },
          })
        )
      );

      expect(resolveEditorExtensions(resolved)).toMatchObject([
        {
          name: 'explicit',
        },
      ]);

      const editor = createBaseEditor({ plugins: [resolved] });

      expect(editor.api.explicit.ping()).toBe('pong');
    });

    it('supports plugin-scoped secondary editor extension keys', () => {
      const resolved = resolvePluginTest(
        createBasePlugin({
          key: 'runtime',
        }).extendExtension('custom', {
          api: {
            runtime: { ping: () => true },
          },
        })
      );

      expect(resolveEditorExtensions(resolved)).toMatchObject([
        { name: 'runtime:custom' },
      ]);
    });

    it('preserves symbol properties when normalizing keyed editor extensions', () => {
      const metadata = Symbol('metadata');
      const resolved = resolvePluginTest(
        createBasePlugin({
          key: 'runtime',
        }).extendExtension({
          key: 'custom',
          [metadata]: 'kept',
          api: {
            runtime: {
              ping: () => 'pong' as const,
            },
          },
        })
      );
      const [extension] = resolveEditorExtensions(resolved) as Record<
        PropertyKey,
        unknown
      >[];

      expect(extension.name).toBe('runtime:custom');
      expect(extension[metadata]).toBe('kept');
      expect(Object.hasOwn(extension, 'key')).toBe(false);
    });

    it('merges repeated unnamed editor extensions before Plite install', () => {
      const plugin = createBasePlugin({
        key: 'runtime',
      })
        .extendExtension({
          api: {
            runtime: {
              first: () => 'first' as const,
            },
          },
          tx: {
            runtimeFirst: () => ({
              run: () => 'first-tx' as const,
            }),
          },
        })
        .extendExtension({
          api: {
            runtime: {
              second: () => 'second' as const,
            },
          },
          tx: {
            runtimeSecond: () => ({
              run: () => 'second-tx' as const,
            }),
          },
        });

      const editor = createBaseEditor({ plugins: [plugin] });

      expect(editor.api.runtime.first()).toBe('first');
      expect(editor.api.runtime.second()).toBe('second');

      editor.update((tx) => {
        expect(tx.runtimeFirst.run()).toBe('first-tx');
        expect(tx.runtimeSecond.run()).toBe('second-tx');
      });
    });

    it('merges repeated keyed editor extensions before Plite install', () => {
      const plugin = createBasePlugin({
        key: 'runtime',
      })
        .extendExtension('secondary', {
          api: {
            runtime: {
              first: () => 'first' as const,
            },
          },
        })
        .extendExtension('secondary', {
          api: {
            runtime: {
              second: () => 'second' as const,
            },
          },
        });

      const editor = createBaseEditor({ plugins: [plugin] });

      expect(editor.api.runtime.first()).toBe('first');
      expect(editor.api.runtime.second()).toBe('second');
    });
  });

  describe('configure', () => {
    const basePlugin = createBasePlugin({
      key: 'testPlugin',
      options: {
        optionA: 'initial',
        optionB: 10,
      },
    });

    it('overrides options without mutating the original plugin', () => {
      const configured = basePlugin.configure({
        options: {
          optionA: 'modified',
        },
      });

      expect(resolvePluginTest(configured).options).toEqual({
        optionA: 'modified',
        optionB: 10,
      });
      expect(basePlugin.options).toEqual({
        optionA: 'initial',
        optionB: 10,
      });
    });

    it('supports function-based configuration', () => {
      const configured = basePlugin.configure((ctx) => ({
        options: {
          optionB: ctx.plugin.options.optionB * 2,
          optionC: 'new option',
        },
      }));

      expect(resolvePluginTest(configured).options).toEqual({
        optionA: 'initial',
        optionB: 20,
        optionC: 'new option',
      });
    });

    it('keeps only the last configure result when configure is chained', () => {
      const configured = basePlugin
        .configure({ options: { optionA: 'first change' } })
        .configure({ options: { optionB: 30 } })
        .configure(() => ({ options: { optionB: 40 } }));

      expect(resolvePluginTest(configured).options).toEqual({
        optionA: 'initial',
        optionB: 40,
      });
    });

    it('reads configured types inside parser extensions', () => {
      const tableCellPlugin = createBasePlugin({
        key: 'td',
      }).extend(({ plugin }) => ({
        parsers: {
          html: {
            deserializer: {
              parse: () => ({ type: plugin.node.type }),
            },
          },
        },
      }));

      const configuredPlugin = tableCellPlugin.configure({
        node: { type: 'custom-td' },
      });

      const editor = createBaseEditor({ plugins: [configuredPlugin] });
      const resolvedPlugin = editor.getPlugin(configuredPlugin);
      const createContext = prepareParserPluginContext(editor, resolvedPlugin);
      const parsedNode = editor.read((state) =>
        resolvedPlugin.parsers?.html?.deserializer?.parse?.({
          ...createContext(state),
          element: document.createElement('td'),
          node: {},
        })
      );

      expect(parsedNode).toEqual({ type: 'custom-td' });
    });

    it('reads configured types inside tx extensions', () => {
      let observedType = 'defaultType';

      const configuredPlugin = createBasePlugin({
        key: 'testPlugin',
        node: { type: 'defaultType' },
      })
        .configure({
          node: { type: 'customType' },
        })
        .extendTx(({ plugin }) => () => ({
          observeType: () => {
            observedType = plugin.node.type;
          },
        }));

      const editor = createBaseEditor({
        plugins: [configuredPlugin],
      });

      editor.update((tx) => tx.testPlugin.observeType());

      expect(observedType).toBe('customType');
    });

    it('can override plugin parsers at the root', () => {
      const linkPlugin = createBasePlugin({
        key: 'a',
        parsers: {
          html: {
            deserializer: {
              parse: () => ({ href: true }),
              withoutChildren: false,
            },
          },
        },
      });

      const editor = createBaseEditor({
        plugins: [
          linkPlugin.extend(() => ({
            parsers: {
              html: {
                deserializer: {
                  withoutChildren: true,
                  parse: () => ({ test: true }),
                },
              },
            },
          })),
        ],
      });

      const plugin = editor.getPlugin(linkPlugin);
      const createContext = prepareParserPluginContext(editor, plugin);

      expect(
        editor.read((state) =>
          plugin.parsers.html?.deserializer?.parse?.({
            ...createContext(state),
            element: document.createElement('a'),
            node: {},
          })
        )
      ).toEqual({
        test: true,
      });
      expect(plugin.parsers.html?.deserializer?.withoutChildren).toBe(true);
    });
  });

  describe('configurePlugin', () => {
    it('configures an existing nested plugin', () => {
      const child = createBasePlugin({
        key: 'aa',
        options: { another: 'b', initialValue: 'aa' },
      });

      const editor = createBaseEditor({
        plugins: [
          createBasePlugin({
            key: 'a',
            plugins: [child],
          }).configurePlugin(child, {
            options: {
              initialValue: 'aaa',
            },
          }),
        ],
      });

      expect(editor.plugins.aa.options).toEqual({
        another: 'b',
        initialValue: 'aaa',
      });
    });

    it('does not add a plugin when the target is missing', () => {
      const child = createBasePlugin({
        key: 'aa',
        options: { initialValue: 'aa' },
      });

      const editor = createBaseEditor({
        plugins: [
          createBasePlugin({
            key: 'a',
            plugins: [child],
          }).configurePlugin({ key: 'bb' }, { options: { newOption: 'new' } }),
        ],
      });

      expect(editor.plugins.aa.options).toEqual({
        initialValue: 'aa',
      });
      expect(editor.plugins.bb).toBeUndefined();
    });

    it('configures deeply nested plugins', () => {
      const grandchild = createBasePlugin({
        key: 'c',
        node: { element: {} },
        options: { a: 1 },
      });

      const child = createBasePlugin({
        key: 'b',
        plugins: [grandchild],
      });

      const editor = createBaseEditor({
        plugins: [
          createBasePlugin({
            key: 'a',
            plugins: [child],
          }).configurePlugin(grandchild, {
            node: { element: { selectable: false } },
            options: { a: 2 },
          }),
        ],
      });

      expect(editor.plugins.c.node.element?.selectable).toBe(false);
      expect(editor.plugin(grandchild).getOptions().a).toBe(2);
    });
  });
});
