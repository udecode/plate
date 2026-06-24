import { BasicBlocksPlugin } from '@platejs/basic-nodes/react';
import { LinkPlugin } from '@platejs/link/react';

import {
  resolveCreatePluginTest,
  resolvePluginTest,
} from '../../internal/plugin/resolveCreatePluginTest';
import {
  type PluginConfig,
  createBasePlateEditor,
  createEditorPlugin,
} from '../index';

describe('createEditorPlugin', () => {
  describe('extend', () => {
    it('keeps the original key while merging object config', () => {
      const plugin = resolvePluginTest(
        createEditorPlugin({ key: 'a', node: { type: 'a' } }).extend({
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
      const plugin = resolveCreatePluginTest((editor: any) => ({
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
        createEditorPlugin({
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

    it('can extend shipped nested plugins', () => {
      const editor = createBasePlateEditor({
        plugins: [
          BasicBlocksPlugin.extendPlugin(
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
      const childPlugin = createEditorPlugin({
        key: 'child',
        options: { childOption: 'child' },
      }).extendEditorApi(() => ({
        method: () => 'child',
      }));

      const extendedPlugin = createEditorPlugin({
        key: 'parent',
        options: { parentOption: 'parent' },
        plugins: [childPlugin],
      }).extendPlugin(childPlugin, (ctx) => ({
        options: {
          extendedOption: `extended ${ctx.plugin.options.childOption}`,
        },
      }));

      const editor = createBasePlateEditor({
        plugins: [extendedPlugin],
      });

      expect(editor.getOptions(childPlugin)).toEqual({
        childOption: 'child',
        extendedOption: 'extended child',
      });
      expect(editor.getOptions(childPlugin)).not.toHaveProperty('parentOption');
    });

    it('can add missing nested plugins and update them later', () => {
      const editor = createBasePlateEditor({
        plugins: [
          createEditorPlugin({
            key: 'a',
            node: { type: 'a' },
            plugins: [
              createEditorPlugin({
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
      createEditorPlugin({ key: 'txPlugin' })
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
      createEditorPlugin({ key: 'sourcePlugin' })
        .extendTxGroup('foreignTx', () => () => ({
          replace: (text: string) => text.length,
        }))
        .extend(({ editor }) => {
          const replace = (text: string) => {
            // @ts-expect-error extendTxGroup does not add the plugin-owned group
            type _MissingPluginGroup = Parameters<
              Parameters<typeof editor.update>[0]
            >[0]['sourcePlugin'];

            return editor.update((tx) => {
              const length = tx.foreignTx.replace(text);

              return length satisfies number;
            });
          };

          replace('ok');

          return {};
        });

      expect(1).toBe(1);
    });
  });

  describe('configure', () => {
    const basePlugin = createEditorPlugin({
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
      const tableCellPlugin = createEditorPlugin({
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

      const resolvedPlugin = resolvePluginTest(configuredPlugin);
      const parsedNode = resolvedPlugin.parsers?.html?.deserializer?.parse?.(
        {} as any
      );

      expect(parsedNode).toEqual({ type: 'custom-td' });
    });

    it('reads configured types inside tx extensions', () => {
      let observedType = 'defaultType';

      const configuredPlugin = createEditorPlugin({
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

      const editor = createBasePlateEditor({
        plugins: [configuredPlugin],
      });

      editor.update((tx) => tx.testPlugin.observeType());

      expect(observedType).toBe('customType');
    });

    it('can override shipped plugin parsers at the root', () => {
      const editor = createBasePlateEditor({
        plugins: [
          LinkPlugin.extend(() => ({
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

      const plugin = editor.getPlugin(LinkPlugin);

      expect(plugin.parsers.html?.deserializer?.parse?.({} as any)).toEqual({
        test: true,
      });
      expect(plugin.parsers.html?.deserializer?.withoutChildren).toBe(true);
    });
  });

  describe('configurePlugin', () => {
    it('configures an existing nested plugin', () => {
      const child = createEditorPlugin({
        key: 'aa',
        options: { another: 'b', initialValue: 'aa' },
      });

      const editor = createBasePlateEditor({
        plugins: [
          createEditorPlugin({
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
      const editor = createBasePlateEditor({
        plugins: [
          createEditorPlugin({
            key: 'a',
            plugins: [
              createEditorPlugin({
                key: 'aa',
                options: { initialValue: 'aa' },
              }),
            ],
          }).configurePlugin({ key: 'bb' }, { options: { newOption: 'new' } }),
        ],
      });

      expect(editor.plugins.aa.options).toEqual({
        initialValue: 'aa',
      });
      expect(editor.plugins.bb).toBeUndefined();
    });

    it('configures deeply nested plugins', () => {
      const grandchild = createEditorPlugin({
        key: 'c',
        node: { isElement: true },
        options: { a: 1 },
      });

      const child = createEditorPlugin({
        key: 'b',
        plugins: [grandchild],
      });

      const parent = createEditorPlugin({
        key: 'a',
        plugins: [child],
      });

      const editor = createBasePlateEditor({
        plugins: [
          parent.configurePlugin(grandchild, {
            node: { isElement: false },
            options: { a: 2 },
          }),
        ],
      });

      expect(editor.plugins.c.node.isElement).toBe(false);
      expect(
        editor.getOptions<PluginConfig<any, { a: number }>>({ key: 'c' }).a
      ).toBe(2);
    });
  });
});
