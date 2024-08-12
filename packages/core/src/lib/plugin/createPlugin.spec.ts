import { BasicElementsPlugin } from '@udecode/plate-basic-elements';
import { ELEMENT_LINK, LinkPlugin } from '@udecode/plate-link';

import { createPlateEditor } from '../../react';
import {
  type PlatePluginComponent,
  createPlugin,
  getPlugin,
  getPluginOptions,
  resolveCreatePluginTest,
  resolvePluginTest,
} from '../index';

describe('createPlugin', () => {
  const basePlugin = createPlugin({ key: 'a', type: 'a' });

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
        createPlugin({
          key: 'a',
          plugins: [
            createPlugin({
              key: 'aa',
              type: 'aa',
            }),
          ],
          type: 'a',
        }).extendPlugin('aa', {
          type: 'aaa',
        })
      );

      expect(plugin.plugins[0].type).toBe('aaa');
    });
  });

  describe('when extendPlugin twice', () => {
    it('should be', () => {
      const plugin = resolvePluginTest(
        createPlugin({
          key: 'a',
          plugins: [
            createPlugin({
              key: 'aa',
              type: 'aa',
            }),
          ],
          type: 'a',
        })
          .extendPlugin('aa', {
            type: 'aaa',
          })
          .extendPlugin('aa', {
            type: 'aab',
          })
      );

      expect(plugin.plugins[0].type).toBe('aab');
    });
  });

  describe('when extendPlugin nested', () => {
    it('should be', () => {
      const editor = createPlateEditor({
        plugins: [
          createPlugin({
            key: 'a',
            plugins: [
              createPlugin({
                key: 'aa',
                type: 'aa',
              }).extendPlugin('aaa', {
                options: {
                  a: 1,
                  b: 1,
                },
                plugins: [
                  createPlugin({ key: 'bbb', options: {}, type: 'bbb' }),
                ],
                type: 'aaa',
              }),
            ],
            type: 'a',
          }).extendPlugin('aa', {
            plugins: [
              createPlugin({
                key: 'aaa',
                plugins: [
                  createPlugin({
                    key: 'bbb',
                    options: {
                      a: 1,
                    },
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      const plugin = getPluginOptions(editor, 'aaa');
      const plugin2 = getPluginOptions(editor, 'bbb');

      expect(plugin.a).toBe(1);
      expect(plugin.b).toBe(1);
      expect(plugin2.a).toBe(1);
    });
  });

  describe('extendPlugin for nested plugins', () => {
    it('should correctly extend a nested plugin', () => {
      const editor = createPlateEditor({
        plugins: [
          createPlugin({
            key: 'parent',
            plugins: [
              createPlugin({
                key: 'child',
              }).extendPlugin('child2', {
                options: {
                  testOption: 1,
                },
                plugins: [
                  createPlugin({
                    key: 'grandchild',
                    options: { testOption: 1 },
                  }),
                ],
                type: 'aaa',
              }),
            ],
          }).extendPlugin('child', {
            plugins: [
              createPlugin({
                key: 'grandchild',
                options: {
                  testOption: 1,
                },
              }),
            ],
          }),
        ],
      });

      const grandchildOptions = getPluginOptions<{ testOption: number }>(
        editor,
        'grandchild'
      );

      expect(grandchildOptions.testOption).toBe(1);
    });
  });

  describe('when new extendPlugin', () => {
    it('should be', () => {
      const plugin = resolvePluginTest(
        createPlugin({
          key: 'a',
          type: 'a',
        }).extendPlugin('aa', {
          type: 'aaa',
        })
      );

      expect(plugin.plugins[0].type).toBe('aaa');
    });
  });

  describe('when new extendPlugin twice', () => {
    it('should be', () => {
      const plugin = resolvePluginTest(
        createPlugin({
          key: 'a',
          type: 'a',
        })
          .extendPlugin('aa', {
            type: 'aaa',
          })
          .extendPlugin('aa', {
            type: 'aab',
          })
      );

      expect(plugin.plugins[0].type).toBe('aab');
    });
  });

  describe('when extend twice', () => {
    it('should be', () => {
      const basePlugin = createPlugin({
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

  describe('when extend plugins', () => {
    it('should be', () => {
      const plugin = resolvePluginTest(
        BasicElementsPlugin.extendPlugin('heading', {
          options: {
            levels: 5,
          },
          type: 'h',
        })
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
        createPlugin({
          key: 'a',
          plugins: [
            createPlugin({
              key: 'aa',
              type: 'aa',
            }),
          ],
          type: 'a',
        })
          .extend({
            type: 'a_extend',
          })
          .extendPlugin('aa', {
            options: {
              levels: 5,
            },
            type: 'aa_extend',
          })
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
          LinkPlugin.extend({
            deserializeHtml: {
              getNode: () => ({ test: true }),
              withoutChildren: true,
            },
          }),
        ],
      });

      const plugin = getPlugin(editor, ELEMENT_LINK);

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
          createPlugin({
            key: 'a',
            plugins: [
              createPlugin({
                key: 'aa',
                type: 'aa',
              }),
            ],
            type: 'a',
          })
            .extend({
              type: 'athen',
            })
            .extendPlugin('bb', {
              type: 'bb',
            })
            .extendPlugin('aa', {
              type: 'ab',
            })
            .extendPlugin('cc', {
              type: 'cc',
            })
            .extend({
              type: 'athen2',
            })
            .extend({
              type: 'a1',
            })
            .extendPlugin('aa', {
              type: 'aa1',
            })
            .extendPlugin('cc', {
              type: 'cc1',
            }),
        ],
      });

      const a = getPlugin(editor, 'a');
      const aa = getPlugin(editor, 'aa');
      const bb = getPlugin(editor, 'bb');
      const cc = getPlugin(editor, 'cc');

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
          createPlugin({
            key: 'parent1',
            plugins: [
              createPlugin({
                key: 'child1',
                options: {
                  initialValue: 'child1',
                },
              }),
            ],
          }),
          createPlugin({
            key: 'parent2',
            plugins: [
              createPlugin({
                key: 'child2',
                options: {
                  initialValue: 'child2',
                },
              }),
            ],
          }).extendPlugin('child1', {
            options: {
              extendedValue: 'extended child1',
            },
          }),
        ],
      });

      const child1Plugin = getPlugin(editor, 'child1');
      const child1Options = getPluginOptions(editor, 'child1');

      expect(child1Plugin.key).toBe('child1');
      expect(child1Options.initialValue).toBe('child1');
      expect(child1Options.extendedValue).toBe('extended child1');
    });
  });

  describe('configure method', () => {
    const basePlugin = createPlugin({
      key: 'testPlugin',
      options: {
        optionA: 'initial',
        optionB: 10,
      },
    });

    it('should override existing options', () => {
      const configured = basePlugin.configure({
        optionA: 'modified',
      });

      const resolved = resolvePluginTest(configured);

      expect(resolved.options).toEqual({
        optionA: 'modified',
        optionB: 10,
      });
    });

    it('should work with function-based configuration', () => {
      const configured = basePlugin.configure((ctx) => ({
        optionB: ctx.plugin.options.optionB * 2,
        optionD: 'new option',
      }));

      const resolved = resolvePluginTest(configured);

      expect(resolved.options).toEqual({
        optionA: 'initial',
        optionB: 20,
        optionD: 'new option',
      });
    });

    it('should allow chaining configure calls', () => {
      const configured = basePlugin
        .configure({ optionA: 'first change' })
        .configure({ optionB: 30 })
        .configure((ctx) => ({ optionB: ctx.plugin.options.optionB + 10 }));

      const resolved = resolvePluginTest(configured);

      expect(resolved.options).toEqual({
        optionA: 'first change',
        optionB: 40,
      });
    });

    it('should not modify the original plugin', () => {
      basePlugin.configure({ optionA: 'modified' });

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

    // TODO
    // it('should allow configuration after extension, using previous options', () => {
    //   const extendedPlugin = basePlugin.extend((ctx) => ({
    //     options: {
    //       ...ctx.plugin.options,
    //       optionC: ctx.plugin.options.optionA + '1',
    //     },
    //   }));
    //
    //   const configured = extendedPlugin.configure((ctx) => ({
    //     optionA: '',
    //   }));
    //
    //   const resolved = resolvePluginTest(configured);
    //
    //   expect(resolved.options.optionC).toEqual('1');
    // });
  });

  describe('when configure twice', () => {
    it('should override existing options', () => {
      const basePlugin = createPlugin({
        key: 'testPlugin',
        options: {
          optionA: 'initial',
          optionB: 'initial',
        },
      });

      const configuredOnce = basePlugin.configure({
        optionA: 'modified',
      });

      const configuredTwice = configuredOnce.configure({
        optionB: 'modified',
      });

      const resolvedPlugin = resolvePluginTest(configuredTwice);

      expect(resolvedPlugin.options).toEqual({
        optionA: 'modified',
        optionB: 'modified',
      });
      expect(resolvedPlugin.options).not.toHaveProperty('newOption');
    });

    it('should allow function-based configuration to override existing options', () => {
      const basePlugin = createPlugin({
        key: 'testPlugin',
        options: {
          count: 0,
          text: 'initial',
        },
      });

      const configuredOnce = basePlugin.configure((ctx) => ({
        count: ctx.plugin.options.count + 1,
      }));

      const configuredTwice = configuredOnce.configure((ctx) => ({
        count: ctx.plugin.options.count + 1,
        text: 'modified',
      }));

      const resolvedPlugin = resolvePluginTest(configuredTwice);

      expect(resolvedPlugin.options).toEqual({
        count: 2,
        text: 'modified',
      });
      expect(resolvedPlugin.options).not.toHaveProperty('newOption');
    });
  });

  describe('when configurePlugin', () => {
    it('should configure an existing plugin', () => {
      const plugin = resolvePluginTest(
        createPlugin({
          key: 'a',
          plugins: [
            createPlugin({
              key: 'aa',
              options: { initialValue: 'aa' },
            }),
          ],
        }).configurePlugin('aa', { newOption: 'new' })
      );

      expect(plugin.plugins[0].options).toEqual({
        initialValue: 'aa',
        newOption: 'new',
      });
    });

    it('should not add a new plugin if not found', () => {
      const basePlugin = createPlugin({
        key: 'a',
        plugins: [
          createPlugin({
            key: 'aa',
            options: { initialValue: 'aa' },
          }),
        ],
      });

      const configuredPlugin = resolvePluginTest(
        basePlugin.configurePlugin('bb', { newOption: 'new' })
      );

      expect(configuredPlugin.plugins).toHaveLength(1);
      expect(configuredPlugin.plugins[0].key).toBe('aa');
      expect(configuredPlugin.plugins[0].options).toEqual({
        initialValue: 'aa',
      });
    });

    it('should configure a deeply nested plugin', () => {
      const plugin = resolvePluginTest(
        createPlugin({
          key: 'a',
          plugins: [
            createPlugin({
              key: 'b',
              plugins: [
                createPlugin({
                  key: 'c',
                  options: { initialValue: 'c' },
                }),
              ],
            }),
          ],
        }).configurePlugin('c', { newOption: 'new' })
      );

      expect(plugin.plugins[0].plugins[0].options).toEqual({
        initialValue: 'c',
        newOption: 'new',
      });
    });
  });

  describe('withComponent method', () => {
    it('should set the component for the plugin', () => {
      const MockComponent: PlatePluginComponent = () => null;
      const basePlugin = createPlugin({ key: 'testPlugin' });

      const pluginWithComponent = basePlugin.withComponent(MockComponent);
      const resolvedPlugin = resolvePluginTest(pluginWithComponent);

      expect(resolvedPlugin.component).toBe(MockComponent);
    });

    it('should override an existing component', () => {
      const OriginalComponent: PlatePluginComponent = () => null;
      const NewComponent: PlatePluginComponent = () => null;

      const basePlugin = createPlugin({
        component: OriginalComponent,
        key: 'testPlugin',
      });

      const pluginWithNewComponent = basePlugin.withComponent(NewComponent);
      const resolvedPlugin = resolvePluginTest(pluginWithNewComponent);

      expect(resolvedPlugin.component).not.toBe(OriginalComponent);
      expect(resolvedPlugin.component).toBe(NewComponent);
    });
  });
});
