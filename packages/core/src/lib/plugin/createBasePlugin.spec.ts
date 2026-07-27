import {
  ContentSlice,
  defineEditorExtension,
  editorCommands,
  property,
  schema,
  target,
} from '@platejs/plite';
import { writeHostFragmentData } from '@platejs/plite-dom';

import { resolvePluginTest } from '../../internal/plugin/resolveCreatePluginTest';
import { prepareHtmlPluginContext } from '../plugins/html/HtmlPlugin';
import {
  type AnyBasePlugin,
  type PluginConfig,
  createBaseEditor,
  createBasePlugin,
} from '../index';
import { getEditorPlugin } from './getEditorPlugin';

const resolveEditorExtensions = (plugin: AnyBasePlugin) => {
  const editor = createBaseEditor({
    plugins: [plugin],
  });
  const resolvedPlugin = editor.getPlugin(plugin);
  const context = getEditorPlugin(editor, resolvedPlugin);

  return resolvedPlugin.__editorExtensions.flatMap((extension) => {
    const input = extension(context);

    if (!input) return [];

    return Array.isArray(input) ? input : [input];
  });
};

describe('createBasePlugin', () => {
  it('authors one inferred MIME codec before terminal configuration', () => {
    const RecordsPlugin = createBasePlugin({
      api: {
        serialize: (count: number) => `records:${count}`,
      },
      codecs: ({ api, defineCodecs }) =>
        defineCodecs({
          'application/x-plate-records': {
            decode: ({ data, source, state }) => {
              data satisfies string;
              source.types satisfies readonly string[];
              state.schema satisfies object;

              return ContentSlice.closed([
                {
                  children: [{ text: data }],
                  type: 'p',
                },
              ]);
            },
            encode: ({ slice, state }) => {
              slice.openStart satisfies number;
              state.schema satisfies object;

              return api.serialize(slice.content.length);
            },
            scope: 'document',
          },
        }),
      key: 'records',
    });
    const editor = createBaseEditor({ plugins: [RecordsPlugin] });
    const output: Record<string, string> = {};

    const formats = writeHostFragmentData(
      editor,
      {
        setData: (format, value) => {
          output[format] = value;
        },
      },
      ContentSlice.closed([
        {
          children: [{ text: 'value' }],
          type: 'p',
        },
      ])
    );

    expect(formats).toEqual(['application/x-plate-records', 'text/html']);
    expect(output).toEqual({
      'application/x-plate-records': 'records:1',
      'text/html': '<p>value</p>',
    });
  });

  it('authors self and foreign HTML codecs before terminal configuration', () => {
    const TargetPlugin = createBasePlugin({
      key: 'htmlTarget',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    });
    const selfExtension = () => ({
      decode: () => ({}),
      decodeOnly: true as const,
      match: [{ tag: 'section' }] as const,
    });
    const foreignExtension = () => ({
      decode: () => ({}),
      decodeOnly: true as const,
      match: [{ tag: 'article' }] as const,
    });
    const plugin = createBasePlugin({
      key: 'htmlOwner',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({ 'text/html': selfExtension() }),
    }).extend(({ defineCodecs }) => ({
      codecs: defineCodecs(TargetPlugin, {
        'text/html': foreignExtension(),
      }),
    }));

    const editor = createBaseEditor({
      plugins: [TargetPlugin, plugin],
    });
    const resolvedPlugin = editor.getPlugin(plugin);

    expect(resolvedPlugin.__htmlCodecExtensions).toEqual([
      { extension: expect.any(Function), targetKey: null },
      {
        extension: expect.any(Function),
        targetKey: 'htmlTarget',
      },
    ]);
    expect(
      resolvedPlugin.__htmlCodecExtensions.every((extension) =>
        Object.isFrozen(extension)
      )
    ).toBe(true);
    expect(() =>
      (plugin.configure as any)({
        schema: {
          element: {
            content: schema.content.text({ default: 'text', min: 1 }),
          },
        },
      })
    ).toThrow('cannot define schema through .configure()');
    expect(
      (plugin.configure as any)({ type: 'configured-html-owner' }).type
    ).toBe('configured-html-owner');
  });

  it('freezes compile-time target keys', () => {
    const plugin = createBasePlugin({
      key: 'no-config',
      targetPluginKeys: ['paragraph'],
    });

    expect(plugin.targetPluginKeys).toEqual(['paragraph']);
    expect(Object.isFrozen(plugin.targetPluginKeys)).toBe(true);
  });

  it('keeps schema creation-owned across static and contextual layers', () => {
    const plugin = createBasePlugin({ key: 'creationOwnedSchema' });

    expect(() =>
      (plugin.extend as any)({
        schema: { mark: property.boolean() },
      })
    ).toThrow('cannot define schema through .extend()');
    expect(() =>
      (plugin.configure as any)({
        schema: { mark: property.boolean() },
      })
    ).toThrow('cannot define schema through .configure()');

    const contextual = (plugin.extend as any)(() => ({
      schema: { mark: property.boolean() },
    }));

    expect(() => createBaseEditor({ plugins: [contextual] })).toThrow(
      'extension callbacks cannot define `schema`'
    );
  });

  it('locks the authored schema on every descriptor', () => {
    const plugin = createBasePlugin({
      key: 'lockedSchema',
      schema: { mark: property.boolean() },
    });

    expect(Object.getOwnPropertyDescriptor(plugin, 'schema')).toMatchObject({
      configurable: false,
      writable: false,
    });
    expect(() => {
      (plugin as any).schema = { mark: property.string() };
    }).toThrow();
    expect(plugin.schema).toEqual({ mark: property.boolean() });
    expect(
      Object.getOwnPropertyDescriptor(plugin.clone(), 'schema')
    ).toMatchObject({
      configurable: false,
      writable: false,
    });
  });

  it('preserves inline property validators through plugin resolution', () => {
    const width = property.number({
      validate: (value): value is number =>
        typeof value === 'number' && value > 0,
      validationVersion: 1,
    });
    const plugin = resolvePluginTest(
      createBasePlugin({
        key: 'policy-node',
        schema: {
          element: {
            content: schema.content.open({ default: 'text', min: 1 }),
            properties: {
              width,
            },
          },
        },
      })
    );

    const resolved = plugin.schema.element?.properties?.width;

    expect(resolved?.validate).toBe(width.validate);
    expect(typeof resolved?.validate).toBe('function');
    expect(resolved?.validate?.(1)).toBe(true);
    expect(resolved?.validate?.(-1)).toBe(false);
  });

  it('contextually types schema factories over initialState', () => {
    type Config = PluginConfig<'typed-node-schema', { targetTypes: string[] }>;

    const plugin = createBasePlugin<Config>({
      key: 'typed-node-schema',
      initialState: { targetTypes: ['p'] },
      schema: ({ key, initialState, type }) => ({
        properties: [
          schema.elementProperty(
            schema.key.prefix(`${key}:${type}:`),
            property.json(),
            { target: target.types(initialState.targetTypes) }
          ),
        ],
      }),
    });
    const editor = createBaseEditor({
      plugins: [plugin],
    });

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
    it('keeps semantic identity while merging runtime initialState', () => {
      const plugin = resolvePluginTest(
        createBasePlugin({
          key: 'a',
          type: 'a',
          inject: {
            nodeProps: {
              nodeKey: 'b',
            },
          },
          initialState: {
            enabled: true,
          },
        })
      );

      expect({
        inject: plugin.inject,
        key: plugin.key,
        type: plugin.type,
      }).toEqual({
        inject: {
          nodeProps: {
            nodeKey: 'b',
          },
        },
        key: 'a',
        type: 'a',
      });
    });

    it('lets the last extend win for overlapping fields', () => {
      const plugin = resolvePluginTest(
        createBasePlugin({
          key: 'a',
          type: 'a',
          initialState: { first: true },
        })
          .extend({
            inject: { nodeProps: { nodeKey: 'b' } },
            initialState: { second: true },
          })
          .extend({
            inject: { nodeProps: { nodeKey: 'c' } },
            initialState: { third: true },
          })
      );

      expect(plugin.inject).toEqual({
        nodeProps: {
          nodeKey: 'c',
        },
      });
      expect(plugin.type).toBe('a');
      expect(plugin.initialState).toEqual({
        first: true,
        second: true,
        third: true,
      });
    });

    it('infers tx groups in later plugin extension contexts', () => {
      createBasePlugin({
        key: 'txPlugin',
        update: () => ({
          replace: (text: string) => text.length,
        }),
      }).extend(({ editor, plugin }) => {
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

    it('infers plugin tx groups in editor extension commands', () => {
      createBasePlugin({
        key: 'txPlugin',
        update: () => ({
          replace: (text: string) => text.length,
        }),
      }).extend(() => ({
        extension: {
          key: 'behavior',
          ...{
            commands: ({ handle }) => [
              handle(editorCommands.insertText, ({ input, state }) =>
                state.transaction((tx) => {
                  const length = tx.txPlugin.replace(input.text);

                  return length satisfies number;
                })
              ),
            ],
          },
        },
      }));

      expect(1).toBe(1);
    });

    it('infers explicit tx groups in later plugin extension contexts', () => {
      createBasePlugin({
        key: 'sourcePlugin',
        extension: {
          tx: {
            foreignTx: () => ({
              replace: (text: string) => text.length,
            }),
          },
        },
      }).extend(({ editor }) => {
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

    it('contextually types declared explicit tx groups', () => {
      type DeclaredTxConfig = PluginConfig<
        'sourcePlugin',
        {},
        {},
        { foreignTx: { replace: (text: string) => number } }
      >;

      const plugin = createBasePlugin<DeclaredTxConfig>({
        key: 'sourcePlugin',
      }).extend<{
        extension: {
          tx: {
            foreignTx: () => DeclaredTxConfig['tx']['foreignTx'];
          };
        };
      }>(() => ({
        extension: {
          tx: {
            foreignTx: () => ({
              replace: (text) => text.length,
            }),
          },
        },
      }));
      const editor = createBaseEditor({ plugins: [plugin] });

      expect(editor.update.foreignTx.replace('text')).toBe(4);
    });

    it('adds editor extensions with plugin-derived names', () => {
      const plugin = createBasePlugin({
        key: 'runtime',
        extension: {
          api: {
            runtime: { ping: () => true },
          },
        },
      });

      expect(resolveEditorExtensions(plugin)).toMatchObject([
        {
          name: 'runtime',
        },
      ]);
    });

    it('adds function-returned editor extension initialState with plugin-derived names', () => {
      const plugin = createBasePlugin({
        api: ({ store }) => ({
          label: () => store.get('prefix'),
        }),
        extension: ({ plugin }) => ({
          api: {
            runtimeExtension: {
              key: () => plugin.key,
            },
          },
        }),
        key: 'runtime',
        initialState: {
          prefix: 'base',
        },
        read: ({ store }) => ({
          readLabel: () => store.get().prefix,
        }),
        selectors: {
          label: (state) => state.prefix.toUpperCase(),
        },
        update: ({ store }) => ({
          updateLabel: () => store.get().prefix,
        }),
      }).configure({
        initialState: {
          prefix: 'consumer',
        },
      });

      expect(resolveEditorExtensions(plugin)).toMatchObject([
        {
          name: 'runtime',
        },
      ]);

      const editor = createBaseEditor({
        plugins: [plugin],
      });

      expect(editor.api.runtimeExtension.key()).toBe('runtime');
      expect(editor.plugin(plugin).api.label()).toBe('consumer');
      expect(editor.plugin(plugin).store.get('label')).toBe('CONSUMER');
      expect(editor.read.runtime.readLabel()).toBe('consumer');
      expect(editor.update.runtime.updateLabel()).toBe('consumer');
    });

    it('keeps built editor extension names', () => {
      const plugin = createBasePlugin({
        key: 'runtime',
        extension: defineEditorExtension({
          name: 'explicit',
          api: {
            explicit: {
              ping: () => 'pong' as const,
            },
          },
        }),
      });

      expect(resolveEditorExtensions(plugin)).toMatchObject([
        {
          name: 'explicit',
        },
      ]);

      const editor = createBaseEditor({
        plugins: [plugin],
      });

      expect(editor.api.explicit.ping()).toBe('pong');
    });

    it('supports plugin-scoped secondary editor extension keys', () => {
      const plugin = createBasePlugin({
        key: 'runtime',
        extension: {
          key: 'custom',
          ...{
            api: {
              runtime: { ping: () => true },
            },
          },
        },
      });

      expect(resolveEditorExtensions(plugin)).toMatchObject([
        { name: 'runtime:custom' },
      ]);
    });

    it('preserves symbol properties when normalizing keyed editor extensions', () => {
      const metadata = Symbol('metadata');
      const resolved = resolvePluginTest(
        createBasePlugin({
          key: 'runtime',
          extension: {
            key: 'custom',
            [metadata]: 'kept',
            api: {
              runtime: {
                ping: () => 'pong' as const,
              },
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
        extension: {
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
        },
      }).extend({
        extension: {
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
        },
      });

      const editor = createBaseEditor({
        plugins: [plugin],
      });

      expect(editor.api.runtime.first()).toBe('first');
      expect(editor.api.runtime.second()).toBe('second');

      editor.update((tx) => {
        expect(tx.runtimeFirst.run()).toBe('first-tx');
        expect(tx.runtimeSecond.run()).toBe('second-tx');
      });
    });

    it('composes repeated unnamed command factories in declaration order', () => {
      const plugin = createBasePlugin({
        key: 'runtime',
        extension: {
          commands: ({ handle }) => [
            handle(editorCommands.insertText, ({ input, state }) =>
              input.text === 'a'
                ? state.transaction((tx) => tx.text.insert('first'))
                : false
            ),
          ],
        },
      }).extend({
        extension: {
          commands: ({ handle }) => [
            handle(editorCommands.insertText, ({ input, state }) =>
              input.text === 'b'
                ? state.transaction((tx) => tx.text.insert('second'))
                : false
            ),
          ],
        },
      });
      const editor = createBaseEditor({
        plugins: [plugin],
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
          kind: 'text',
        },
      });

      editor.update.text.insert('a');
      editor.update.text.insert('b');

      expect(editor.read.text.string([])).toBe('firstsecond');
    });

    it('merges repeated keyed editor extensions before Plite install', () => {
      const plugin = createBasePlugin({
        key: 'runtime',
        extension: {
          key: 'secondary',
          ...{
            api: {
              runtime: {
                first: () => 'first' as const,
              },
            },
          },
        },
      }).extend({
        extension: {
          key: 'secondary',
          ...{
            api: {
              runtime: {
                second: () => 'second' as const,
              },
            },
          },
        },
      });

      const editor = createBaseEditor({
        plugins: [plugin],
      });

      expect(editor.api.runtime.first()).toBe('first');
      expect(editor.api.runtime.second()).toBe('second');
    });
  });

  describe('configure', () => {
    const basePlugin = createBasePlugin({
      key: 'testPlugin',
      initialState: {
        valueA: 'initial',
        valueB: 10,
      },
    });

    it('overrides initialState without mutating the original plugin', () => {
      const configured = basePlugin.configure({
        initialState: {
          valueA: 'modified',
        },
      });

      expect(resolvePluginTest(configured).initialState).toEqual({
        valueA: 'modified',
        valueB: 10,
      });
      expect(basePlugin.initialState).toEqual({
        valueA: 'initial',
        valueB: 10,
      });
    });

    it('binds a static component without exposing render.node', () => {
      const Component = () => null;
      const BelowRoot = () => null;
      const configured = basePlugin.configure({
        component: Component,
        initialState: { valueA: 'configured with component' },
        render: { belowRootNodes: BelowRoot },
      });

      expect(resolvePluginTest(configured).render.node).toBe(Component);
      expect(resolvePluginTest(configured).render.belowRootNodes).toBe(
        BelowRoot
      );
      expect(resolvePluginTest(configured).initialState).toEqual({
        valueA: 'configured with component',
        valueB: 10,
      });
      expect(basePlugin.render.node).toBeUndefined();
    });

    it('keeps consumer configuration final while extensions read it', () => {
      const plugin = createBasePlugin({
        key: 'consumerConfiguration',
        initialState: {
          derivedFrom: 'base',
          value: 'base',
        },
      })
        .extend(({ store }) => ({
          initialState: {
            derivedFrom: store.get().value,
            value: 'package',
          },
        }))
        .configure({
          initialState: {
            value: 'consumer',
          },
        });

      expect(resolvePluginTest(plugin).initialState).toEqual({
        derivedFrom: 'consumer',
        value: 'consumer',
      });
    });

    it('rejects a second consumer configuration', () => {
      const configured = basePlugin.configure({
        initialState: { valueA: 'first change' },
      });

      expect(() =>
        (configured.configure as any)({
          initialState: { valueB: 30 },
        })
      ).toThrow('already configured');
    });

    it('resolves contextual configuration per editor before extensions', () => {
      const configuredEditors: string[] = [];
      const plugin = createBasePlugin<
        PluginConfig<'contextual', { editorId: string; value: string }>
      >({
        key: 'contextual',
        initialState: { editorId: '', value: 'initial' },
      })
        .extend(({ store }) => ({
          initialState: { value: `${store.get().value}:extended` },
        }))
        .configure(({ editor }) => {
          configuredEditors.push(editor.id);

          return {
            initialState: { editorId: editor.id, value: 'configured' },
          };
        });
      const first = createBaseEditor({ id: 'first', plugins: [plugin] });
      const second = createBaseEditor({ id: 'second', plugins: [plugin] });

      expect(first.plugin(plugin).store.get()).toEqual({
        editorId: 'first',
        value: 'configured',
      });
      expect(second.plugin(plugin).store.get()).toEqual({
        editorId: 'second',
        value: 'configured',
      });
      expect(configuredEditors).toEqual(['first', 'second']);
    });

    it('rejects authoring after consumer configuration', () => {
      const configured = basePlugin.configure({
        initialState: { valueA: 'configured' },
      });

      expect(() =>
        (configured.extend as any)({
          initialState: { valueB: 30 },
        })
      ).toThrow('already configured');
      expect(() => (configured.clone as any)()).toThrow('already configured');
    });

    it('rejects raw codecs in the base plugin object', () => {
      expect(() =>
        (createBasePlugin as any)({
          codecs: {},
          key: 'invalid-codecs',
        })
      ).toThrow(
        'Plate plugin `codecs` must be declared by the constructor callback.'
      );
    });

    it('rejects component binding in the Base constructor', () => {
      expect(() =>
        (createBasePlugin as any)({
          component: () => null,
          key: 'renderer-owned-constructor',
        })
      ).toThrow('Base plugin constructors are renderer-neutral');
    });

    it('rejects model fields from untyped configure callbacks', () => {
      const plugin = (basePlugin.configure as any)(() => ({
        schema: { mark: property.boolean() },
      }));

      expect(() => createBaseEditor({ plugins: [plugin] })).toThrow(
        'configure callbacks cannot define `schema`'
      );
    });

    it('reads the declared type inside parser contexts', () => {
      const TableCellPlugin = createBasePlugin({
        key: 'td',
        type: 'custom-td',
      });

      const editor = createBaseEditor({
        plugins: [TableCellPlugin],
      });
      const resolvedPlugin = editor.getPlugin(TableCellPlugin);
      const createContext = prepareHtmlPluginContext(editor, resolvedPlugin);
      const context = editor.read((state) => createContext(state));

      expect(context.type).toBe('custom-td');
    });

    it('snapshots current runtime initialState for each parser invocation', () => {
      const callback = () => 'runtime';
      const HtmlParserOptionsPlugin = createBasePlugin({
        key: 'parserOptions',
        initialState: { callback, label: 'one' },
      });
      const editor = createBaseEditor({
        plugins: [HtmlParserOptionsPlugin],
      });
      const createContext = prepareHtmlPluginContext(
        editor,
        HtmlParserOptionsPlugin
      );
      const before = editor.read((state) => createContext(state));

      editor.plugin(HtmlParserOptionsPlugin).store.set({ label: 'two' });

      const after = editor.read((state) => createContext(state));

      expect(before.pluginState).toEqual({ callback, label: 'one' });
      expect(after.pluginState).toEqual({ callback, label: 'two' });
      expect(before.pluginState).not.toBe(after.pluginState);
      expect(Object.isFrozen(before.pluginState)).toBe(true);
      expect(Object.isFrozen(after.pluginState)).toBe(true);
    });

    it('reads the declared type inside tx extensions', () => {
      let observedType = 'unset';

      const TypedPlugin = createBasePlugin({
        key: 'testPlugin',
        type: 'customType',
      }).extend(({ plugin }) => ({
        update: () => ({
          observeType: () => {
            observedType = plugin.type;
          },
        }),
      }));

      const editor = createBaseEditor({
        plugins: [TypedPlugin],
      });

      editor.update((tx) => tx.testPlugin.observeType());

      expect(observedType).toBe('customType');
    });

    it('can override plugin parsers at the root', () => {
      const linkPlugin = createBasePlugin({
        key: 'a',
        parsers: {
          html: {
            transformData: ({ data }) => `base:${data}`,
          },
        },
      });

      const editor = createBaseEditor({
        plugins: [
          linkPlugin.extend(() => ({
            parsers: {
              html: {
                transformData: ({ data }) => `configured:${data}`,
              },
            },
          })),
        ],
      });

      const plugin = editor.getPlugin(linkPlugin);
      const createContext = prepareHtmlPluginContext(editor, plugin);

      expect(
        editor.read((state) =>
          plugin.parsers.html?.transformData?.({
            ...createContext(state),
            data: 'value',
            format: 'text/html',
            source: {
              files: { item: () => null, length: 0 },
              getData: () => '',
              types: [],
            },
          })
        )
      ).toBe('configured:value');
    });
  });
});
