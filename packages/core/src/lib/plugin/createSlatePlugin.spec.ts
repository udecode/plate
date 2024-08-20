import { BasicElementsPlugin } from '@udecode/plate-basic-elements';
import { LinkPlugin } from '@udecode/plate-link';

import { createPlateEditor } from '../../react';
import {
  type PluginConfig,
  createSlatePlugin,
  resolveCreatePluginTest,
  resolvePluginTest,
} from '../index';

describe('createSlatePlugin', () => {
  const basePlugin = createSlatePlugin({ key: 'a', type: 'a' });

  describe('when no extend', () => {
    it(' should be', () => {
      const { key, type } = basePlugin;

      expect({ key, type }).toEqual({ key: 'a', type: 'a' });
    });
  });

  describe('when configure', () => {
    it(' should be', () => {
      const { key, type } = basePlugin;

      expect({ key, type }).toEqual({ key: 'a', type: 'a' });
    });
  });

  describe('when extend', () => {
    it('should be', () => {
      const plugin = resolvePluginTest(
        basePlugin.extend({
          inject: {
            props: {
              nodeKey: 'b',
            },
          },
          options: {
            a: 1,
          },
          type: 'b',
        })
      );

      expect({
        inject: plugin.inject,
        key: plugin.key,
        type: plugin.type,
      }).toEqual({
        inject: {
          props: {
            nodeKey: 'b',
          },
        },
        key: 'a',
        type: 'b',
      });
    });
  });

  describe('when created with a function', () => {
    it('should resolve correctly when mocked', () => {
      const pluginFn = (editor: any) => ({
        key: 'functionPlugin',
        options: { editorId: editor.id },
        type: 'function',
      });

      const plugin = resolveCreatePluginTest(pluginFn);

      expect(plugin.key).toBe('functionPlugin');
      expect(plugin.type).toBe('function');
      expect(plugin.options).toHaveProperty('editorId');
    });
  });

  describe('when extendPlugin', () => {
    it('should be', () => {
      const plugin = resolvePluginTest(
        createSlatePlugin({
          key: 'a',
          plugins: [
            createSlatePlugin({
              key: 'aa',
              type: 'aa',
            }),
          ],
          type: 'a',
        }).extendPlugin(
          { key: 'aa' },
          {
            type: 'aaa',
          }
        )
      );

      expect(plugin.plugins[0].type).toBe('aaa');
    });
  });

  describe('when extendPlugin twice', () => {
    it('should be', () => {
      const plugin = resolvePluginTest(
        createSlatePlugin({
          key: 'a',
          plugins: [
            createSlatePlugin({
              key: 'aa',
              type: 'aa',
            }),
          ],
          type: 'a',
        })
          .extendPlugin(
            { key: 'aa' },
            {
              type: 'aaa',
            }
          )
          .extendPlugin(
            { key: 'aa' },
            {
              type: 'aab',
            }
          )
      );

      expect(plugin.plugins[0].type).toBe('aab');
    });
  });

  describe('when extendPlugin nested', () => {
    it('should be', () => {
      const editor = createPlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'a',
            plugins: [
              createSlatePlugin({
                key: 'aa',
                type: 'aa',
              }).extendPlugin(
                { key: 'aaa' },
                {
                  options: {
                    a: 1,
                    b: 1,
                  },
                  plugins: [
                    createSlatePlugin({ key: 'bbb', options: {}, type: 'bbb' }),
                  ],
                  type: 'aaa',
                }
              ),
            ],
            type: 'a',
          }).extendPlugin(
            { key: 'aa' },
            {
              plugins: [
                createSlatePlugin({
                  key: 'aaa',
                  options: { replaced: 1 },
                  plugins: [
                    createSlatePlugin({
                      key: 'bbb',
                      options: {
                        a: 1,
                      },
                    }),
                  ],
                }),
              ],
            }
          ),
        ],
      });

      const aaaOptions = editor.getOptions<
        PluginConfig<any, { a: number; b: number }>
      >({ key: 'aaa' });
      const bbbOptions = editor.getOptions<PluginConfig<any, { a: number }>>({
        key: 'bbb',
      });

      expect(aaaOptions).toEqual({ replaced: 1 });
      expect(bbbOptions.a).toBe(1);
    });
  });

  describe('extendPlugin context', () => {
    it('should use the plugin context rather than the parent context', () => {
      const childPlugin = createSlatePlugin({
        key: 'child',
        options: { childOption: 'child' },
      }).extendApi(() => ({
        method: () => 'child',
      }));

      const parentPlugin = createSlatePlugin({
        key: 'parent',
        options: { parentOption: 'parent' },
        plugins: [childPlugin],
      });

      const extendedPlugin = parentPlugin.extendPlugin(childPlugin, (ctx) => ({
        options: {
          extendedOption: `extended ${ctx.plugin.options.childOption}`,
        },
      }));

      const editor = createPlateEditor({
        plugins: [extendedPlugin],
      });

      expect(editor.getOptions(childPlugin)).toEqual({
        childOption: 'child',
        extendedOption: 'extended child',
      });
      expect(editor.getOptions(childPlugin)).not.toHaveProperty('parentOption');
    });
  });

  describe('extendPlugin for nested plugins', () => {
    it('should correctly extend a nested plugin', () => {
      const editor = createPlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'parent',
            plugins: [
              createSlatePlugin({
                key: 'child',
              }).extendPlugin(
                { key: 'child2' },
                {
                  options: {
                    testOption: 1,
                  },
                  plugins: [
                    createSlatePlugin({
                      key: 'grandchild',
                      options: { testOption: 1 },
                    }),
                  ],
                  type: 'aaa',
                }
              ),
            ],
          }).extendPlugin(
            { key: 'child' },
            {
              plugins: [
                createSlatePlugin({
                  key: 'grandchild',
                  options: {
                    testOption: 1,
                  },
                }),
              ],
            }
          ),
        ],
      });

      const grandchildOptions = editor.getOptions<
        PluginConfig<any, { testOption: number }>
      >({
        key: 'grandchild',
      });

      expect(grandchildOptions.testOption).toBe(1);
    });
  });

  describe('when new extendPlugin', () => {
    it('should be', () => {
      const plugin = resolvePluginTest(
        createSlatePlugin({
          key: 'a',
          type: 'a',
        }).extendPlugin(
          { key: 'aa' },
          {
            type: 'aaa',
          }
        )
      );

      expect(plugin.plugins[0].type).toBe('aaa');
    });
  });

  describe('when new extendPlugin twice', () => {
    it('should be', () => {
      const plugin = resolvePluginTest(
        createSlatePlugin({
          key: 'a',
          type: 'a',
        })
          .extendPlugin(
            { key: 'aa' },
            {
              type: 'aaa',
            }
          )
          .extendPlugin(
            { key: 'aa' },
            {
              type: 'aab',
            }
          )
      );

      expect(plugin.plugins[0].type).toBe('aab');
    });
  });

  describe('when extend twice', () => {
    it('should be', () => {
      const basePlugin = createSlatePlugin({
        key: 'a',
        options: {
          a: 1,
        },
        type: 'a',
      });

      const plugin = resolvePluginTest(
        basePlugin
          .extend({
            inject: {
              props: {
                nodeKey: 'b',
              },
            },
            options: {
              b: 1,
            },
            type: 'b',
          })
          .extend({
            inject: {
              props: {
                nodeKey: 'c',
              },
            },
            options: {
              b: 1,
              c: 1,
            },
            type: 'b',
          })
      );

      expect({
        inject: plugin.inject,
        key: plugin.key,
        type: plugin.type,
      }).toEqual({
        inject: {
          props: {
            nodeKey: 'c',
          },
        },
        key: 'a',
        type: 'b',
      });
    });
  });

  describe('extend method behavior', () => {
    it('should directly merge object configs and use __extensions for function configs', () => {
      const basePlugin = createSlatePlugin({
        key: 'test',
        options: { initial: true },
        type: 'base',
      });

      const extendedWithFunction = basePlugin.extend(({ options }) => ({
        options: { ...options, functional: true },
      }));

      const extendedWithObject = extendedWithFunction.extend({
        options: { extended: true, functional: false },
        type: 'extended',
      });

      // Check object-based extension
      expect(extendedWithObject.options).toEqual({
        extended: true,
        functional: false,
        initial: true,
      });
      expect(extendedWithObject.type).toBe('extended');

      // Check function-based extension
      expect(extendedWithFunction.__extensions).toHaveLength(1);

      // Resolve the plugin to apply all extensions
      const resolvedPlugin = resolvePluginTest(extendedWithObject);

      expect(resolvedPlugin.options).toEqual({
        extended: true,
        functional: true,
        initial: true,
      });
      expect(resolvedPlugin.type).toBe('extended');
    });
  });

  describe('when extend plugins', () => {
    it('should be', () => {
      const plugin = resolvePluginTest(
        BasicElementsPlugin.extendPlugin(
          { key: 'heading' },
          {
            options: {
              levels: 5,
            },
            type: 'h',
          }
        )
      );

      const headingPlugin = plugin.plugins.find(
        (p: any) => p.key === 'heading'
      );
      const { options, type } = headingPlugin!;

      expect({ options, type }).toEqual({
        options: {
          levels: 5,
        },
        type: 'h',
      });
    });
  });

  describe('when extend + extendPlugin', () => {
    it('should be', () => {
      const plugin = resolvePluginTest(
        createSlatePlugin({
          key: 'a',
          plugins: [
            createSlatePlugin({
              key: 'aa',
              type: 'aa',
            }),
          ],
          type: 'a',
        })
          .extend({
            type: 'a_extend',
          })
          .extendPlugin(
            { key: 'aa' },
            {
              options: {
                levels: 5,
              },
              type: 'aa_extend',
            }
          )
      );

      const headingPlugin = plugin.plugins.find((p) => p.key === 'aa');
      const { options, type } = headingPlugin!;

      expect({ nestedType: type, options, type: plugin.type }).toEqual({
        nestedType: 'aa_extend',
        options: {
          levels: 5,
        },
        type: 'a_extend',
      });
    });
  });

  describe('when default plugin has extend and we override a function at the root', () => {
    it('should be', () => {
      const editor = createPlateEditor({
        plugins: [
          LinkPlugin.extend(() => ({
            deserializeHtml: {
              getNode: () => ({ test: true }),
              withoutChildren: true,
            },
          })),
        ],
      });

      const plugin = editor.getPlugin(LinkPlugin);

      expect(plugin.deserializeHtml?.getNode?.({} as any)).toEqual({
        test: true,
      });
      expect(plugin.deserializeHtml?.withoutChildren).toBeTruthy();
    });
  });

  describe('when nested plugin + extend + new extendPlugin', () => {
    it('should be', () => {
      const editor = createPlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'a',
            plugins: [
              createSlatePlugin({
                key: 'aa',
                type: 'aa',
              }),
            ],
            type: 'a',
          })
            .extend({
              type: 'athen',
            })
            .extendPlugin(
              { key: 'bb' },
              {
                type: 'bb',
              }
            )
            .extendPlugin(
              { key: 'aa' },
              {
                type: 'ab',
              }
            )
            .extendPlugin(
              { key: 'cc' },
              {
                type: 'cc',
              }
            )
            .extend({
              type: 'athen2',
            })
            .extend({
              type: 'a1',
            })
            .extendPlugin(
              { key: 'aa' },
              {
                type: 'aa1',
              }
            )
            .extendPlugin(
              { key: 'cc' },
              {
                type: 'cc1',
              }
            ),
        ],
      });

      const a = editor.getPlugin({ key: 'a' });
      const aa = editor.getPlugin({ key: 'aa' });
      const bb = editor.getPlugin({ key: 'bb' });
      const cc = editor.getPlugin({ key: 'cc' });

      expect({
        type: a.type,
      }).toEqual({ type: 'a1' });
      expect({
        type: aa.type,
      }).toEqual({ type: 'aa1' });
      expect({
        type: bb.type,
      }).toEqual({ type: 'bb' });
      expect({
        type: cc.type,
      }).toEqual({ type: 'cc1' });
    });
  });

  describe('when extendPlugin a cousin plugin', () => {
    it('should extend a plugin at the same level', () => {
      const editor = createPlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'parent1',
            plugins: [
              createSlatePlugin({
                key: 'child1',
                options: {
                  initialValue: 'child1',
                },
              }),
            ],
          }),
          createSlatePlugin({
            key: 'parent2',
            plugins: [
              createSlatePlugin({
                key: 'child2',
                options: {
                  initialValue: 'child2',
                },
              }),
            ],
          }).extendPlugin(
            { key: 'child1' },
            {
              options: {
                extendedValue: 'extended child1',
              },
            }
          ),
        ],
      });

      const child1Plugin = editor.getPlugin({ key: 'child1' });
      const child1Options = editor.getOptions<
        PluginConfig<any, { extendedValue: number; initialValue: number }>
      >({ key: 'child1' });

      expect(child1Plugin.key).toBe('child1');
      expect(child1Options.initialValue).toBe('child1');
      expect(child1Options.extendedValue).toBe('extended child1');
    });
  });

  describe('configure method', () => {
    const basePlugin = createSlatePlugin({
      key: 'testPlugin',
      options: {
        optionA: 'initial',
        optionB: 10,
      },
    });

    it('should override existing options', () => {
      const configured = basePlugin.configure({
        options: {
          optionA: 'modified',
        },
      });

      const resolved = resolvePluginTest(configured);

      expect(resolved.options).toEqual({
        optionA: 'modified',
        optionB: 10,
      });
    });

    it('should work with function-based configuration', () => {
      const configured = basePlugin.configure((ctx) => ({
        options: {
          optionB: ctx.plugin.options.optionB * 2,
          optionD: 'new option',
        },
      }));

      const resolved = resolvePluginTest(configured);

      expect(resolved.options).toEqual({
        optionA: 'initial',
        optionB: 20,
        optionD: 'new option',
      });
    });

    it('should override previous configuration on multiple configure calls', () => {
      const configured = basePlugin
        .configure({ options: { optionA: 'first change' } })
        .configure({ options: { optionB: 30 } })
        .configure(() => ({ options: { optionB: 40 } }));

      const resolved = resolvePluginTest(configured);
      expect(resolved.options).toEqual({
        optionA: 'initial', // This remains 'initial' because it's not in the last configure call
        optionB: 40,
      });
    });

    it('should not modify the original plugin', () => {
      basePlugin.configure({ options: { optionA: 'modified' } });

      expect(basePlugin.options).toEqual({
        optionA: 'initial',
        optionB: 10,
      });
    });

    it('should handle empty configuration objects', () => {
      const configured = basePlugin.configure({});

      const resolved = resolvePluginTest(configured);

      expect(resolved.options).toEqual(basePlugin.options);
    });

    it('should allow configuration after extension, using previous options', () => {
      const extendedPlugin = basePlugin.extend((ctx) => ({
        options: {
          ...ctx.plugin.options,
          optionC: ctx.plugin.options.optionA + '1',
        },
      }));

      const configured = extendedPlugin.configure(() => ({
        options: {
          optionA: '',
        },
      }));

      const resolved = resolvePluginTest(configured);

      expect(resolved.options.optionC).toEqual('1');
    });

    it('should allow configuration of type and use it in deserializeHtml.getNode', () => {
      const TableCellPlugin = createSlatePlugin({
        key: 'td',
      }).extend(({ plugin }) => ({
        deserializeHtml: {
          getNode: () => ({ type: plugin.type }),
        },
      }));

      // Configure the plugin to use a custom type
      const configuredPlugin = TableCellPlugin.configure({
        type: 'custom-td',
      });

      // Resolve the plugin
      const resolvedPlugin = resolvePluginTest(configuredPlugin);

      // Call getNode and check the type
      const nodeResult = resolvedPlugin.deserializeHtml!.getNode!({} as any);

      expect(nodeResult).toEqual({ type: 'custom-td' });
    });

    describe('when configure type and use in withOverrides', () => {
      it('should use the configured type in withOverrides', () => {
        const basePlugin = createSlatePlugin({
          key: 'testPlugin',
          type: 'defaultType',
        });

        let type = basePlugin.type;

        const configuredPlugin = basePlugin
          .configure({
            type: 'customType',
          })
          .extend({
            withOverrides: ({ editor, plugin }) => {
              editor.insertText = () => {
                type = plugin.type;
              };

              return editor;
            },
          });

        const editor = createPlateEditor({
          plugins: [configuredPlugin],
        });

        editor.insertText('');

        expect(type).toBe('customType');
      });
    });
  });

  describe('when configure twice', () => {
    it('should override existing options', () => {
      const basePlugin = createSlatePlugin({
        key: 'testPlugin',
        options: {
          optionA: 'initial',
          optionB: 'initial',
        },
      });

      const configuredOnce = basePlugin.configure({
        options: { optionA: 'modified' },
      });
      const configuredTwice = configuredOnce.configure({
        options: { optionB: 'modified' },
      });

      const resolvedPlugin = resolvePluginTest(configuredTwice);
      expect(resolvedPlugin.options).toEqual({
        optionA: 'initial', // This remains 'initial' because it's not in the last configure call
        optionB: 'modified',
      });
      expect(resolvedPlugin.options).not.toHaveProperty('newOption');
    });

    it('should allow function-based configuration to override existing options', () => {
      const basePlugin = createSlatePlugin({
        key: 'testPlugin',
        options: {
          count: 0,
          text: 'initial',
        },
      });

      const configuredOnce = basePlugin.configure((ctx) => ({
        options: {
          count: ctx.plugin.options.count + 1,
        },
      }));
      const configuredTwice = configuredOnce.configure((ctx) => ({
        options: {
          count: ctx.plugin.options.count + 1,
          text: 'modified',
        },
      }));

      const resolvedPlugin = resolvePluginTest(configuredTwice);
      expect(resolvedPlugin.options).toEqual({
        count: 1, // This is 1, not 2, because the last configure overwrites the previous one
        text: 'modified',
      });
      expect(resolvedPlugin.options).not.toHaveProperty('newOption');
    });
  });

  describe('when configurePlugin', () => {
    it('should configure an existing plugin', () => {
      const aa = createSlatePlugin({
        key: 'aa',
        options: { another: 'b', initialValue: 'aa' },
      });

      const plugin = resolvePluginTest(
        createSlatePlugin({
          key: 'a',
          plugins: [aa],
        }).configurePlugin(aa, {
          options: {
            initialValue: 'aaa',
          },
        })
      );

      expect(plugin.plugins[0].options).toEqual({
        another: 'b',
        initialValue: 'aaa',
      });
    });

    it('should not add a new plugin if not found', () => {
      const basePlugin = createSlatePlugin({
        key: 'a',
        plugins: [
          createSlatePlugin({
            key: 'aa',
            options: { initialValue: 'aa' },
          }),
        ],
      });

      const configuredPlugin = resolvePluginTest(
        basePlugin.configurePlugin(
          { key: 'bb' },
          { options: { newOption: 'new' } }
        )
      );

      expect(configuredPlugin.plugins).toHaveLength(1);
      expect(configuredPlugin.plugins[0].key).toBe('aa');
      expect(configuredPlugin.plugins[0].options).toEqual({
        initialValue: 'aa',
      });
    });

    it('should configure a deeply nested plugin', () => {
      const c = createSlatePlugin({
        key: 'c',
        options: { initialValue: 'c' },
      });

      const b = createSlatePlugin({
        key: 'b',
        plugins: [c],
      });

      const a = createSlatePlugin({
        key: 'a',
        plugins: [b],
      });

      const plugin = resolvePluginTest(
        a.configurePlugin(c, { options: { initialValue: 'cc' } })
      );

      expect(plugin.plugins[0].plugins[0].options).toEqual({
        initialValue: 'cc',
      });
    });
  });
});
