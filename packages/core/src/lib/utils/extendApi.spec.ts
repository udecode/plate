import { createBaseEditor } from '../editor';
import {
  type PluginConfig,
  createBasePlugin,
  getEditorPlugin,
} from '../plugin';

describe('extendEditorApi method', () => {
  it('maintain editor and plugin API reference while extending', () => {
    let api1: any;
    let pluginApi1: any;

    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'testPlugin',
        })
          .extendEditorApi(({ api, editor }) => {
            api1 = editor.api;
            pluginApi1 = api;

            return { method1: () => 1 };
          })
          .extendEditorApi(({ api, editor }) => {
            expect(api1).toBe(editor.api);
            expect(pluginApi1).toBe(api);

            return { method2: () => 2 };
          }),
      ],
    });

    expect(editor.api.method2).toBeDefined();
    expect(editor.api.method2()).toBe(2);
  });

  it('correctly handle extendEditorApi with function parameters', () => {
    type CustomConfig = PluginConfig<
      'customPlugin',
      { baseValue: number },
      { multiply: (factor: number) => number }
    >;

    const customPlugin = createBasePlugin<CustomConfig>({
      key: 'customPlugin',
      options: {
        baseValue: 5,
      },
    });

    const extendedPlugin = customPlugin.extendEditorApi(({ getOptions }) => ({
      multiply: (factor) => getOptions().baseValue * factor,
    }));

    const furtherExtendedPlugin = extendedPlugin.extendEditorApi(
      ({ editor, getOptions, setOption }) => ({
        getTotal: (factor: number) =>
          editor.api.multiply(factor) + getOptions().baseValue,
        increment: (amount: number) => {
          setOption('baseValue', getOptions().baseValue + amount);
        },
      })
    );

    const editor = createBaseEditor({
      plugins: [furtherExtendedPlugin],
    });

    expect(editor.plugins.customPlugin.options.baseValue).toBe(5);
    expect(editor.api.multiply(3)).toBe(15);

    editor.api.increment(2);
    expect(editor.plugin(furtherExtendedPlugin).getOption('baseValue')).toBe(7);
    expect(editor.plugins.customPlugin.options.baseValue).toBe(5);

    expect(editor.api.getTotal(3)).toBe(28); // (7 * 3) + 7
  });

  it('correctly handle api extensions through extend, extendEditorApi, and configure', () => {
    const basePlugin = createBasePlugin({
      key: 'testPlugin',
      options: {
        baseValue: 10,
      },
    });

    const extendedPlugin = basePlugin
      .extend({
        options: {
          baseValue: 15,
        },
      })
      .extendEditorApi(({ getOptions }) => ({
        sampleMethod: (inc: number) => getOptions().baseValue + inc,
      }))
      .extend({
        options: {
          baseValue: 20,
        },
      })
      .extendEditorApi(({ editor, plugin: { options } }) => ({
        anotherMethod: () => editor.api.sampleMethod(1) + options.baseValue,
      }));

    const editor = createBaseEditor({
      plugins: [extendedPlugin],
    });

    expect(editor.plugin(extendedPlugin).getOptions().baseValue).toBe(20);
    expect(editor.api.sampleMethod(1)).toBe(21);
    expect(editor.api.anotherMethod()).toBe(41);
  });

  it('allow multiple extendEditorApi calls', () => {
    const basePlugin = createBasePlugin({
      key: 'testPlugin',
      options: {
        baseValue: 10,
      },
    });

    const extendedPlugin = basePlugin
      .extendEditorApi(() => ({
        method1: () => 1,
      }))
      .extendEditorApi(() => ({
        method2: () => 2,
      }))
      .extendEditorApi(({ editor }) => ({
        method3: () => editor.api.method1() + editor.api.method2(),
      }));

    const editor = createBaseEditor({
      plugins: [extendedPlugin],
    });

    expect(editor.api.method1()).toBe(1);
    expect(editor.api.method2()).toBe(2);
    expect(editor.api.method3()).toBe(3);
  });

  it('allow plugin api', () => {
    const testPlugin = createBasePlugin({
      key: 'testPlugin',
      options: {
        baseValue: 10,
      },
    })
      .extendApi(() => ({
        method1: () => 1,
      }))
      .extendApi(() => ({
        method2: () => 2,
      }))
      .extendApi(({ api }) => ({
        method3: () => api.method1() + api.method2(),
      }));

    const editor = createBaseEditor({
      plugins: [
        testPlugin,
        createBasePlugin({
          key: 'another',
        }).extendEditorApi(({ editor }) => ({
          method4: () => getEditorPlugin(editor, testPlugin).api.method3(),
        })),
      ],
    });

    expect(editor.api.method4()).toBe(3);
  });

  it('allow stable plugin api', () => {
    const testPlugin = createBasePlugin({
      key: 'testPlugin',
      options: { baseValue: 10 },
    })
      .extendApi(() => ({ method1: () => 1 }))
      .extendApi(() => ({ method2: () => 2 }))
      .extendApi(({ api }) => ({
        method3: () => api.method1() + api.method2(),
      }));

    const editor = createBaseEditor({
      plugins: [
        testPlugin,
        createBasePlugin({ key: 'another' }).extendEditorApi(({ editor }) => {
          const api = getEditorPlugin(editor, testPlugin).api;

          return {
            method4: () => api.method3(),
          };
        }),
      ],
    });

    expect(editor.api.method4()).toBe(3);
  });

  it('allow overriding plugin APIs', () => {
    const basePlugin = createBasePlugin({
      key: 'basePlugin',
    }).extendApi(() => ({
      method: () => 'base',
    }));

    const overridePlugin = createBasePlugin({
      key: 'overridePlugin',
    }).extendApi(({ editor }) => {
      const { method } = getEditorPlugin(editor, basePlugin).api;

      return {
        method: () => `override ${method()}`,
      };
    });

    const editor = createBaseEditor({
      plugins: [basePlugin, overridePlugin],
    });

    expect(editor.plugin(overridePlugin).api.method()).toBe('override base');
  });

  it('merge nested API properties', () => {
    const basePlugin = createBasePlugin({ key: 'nestedPlugin' })
      .extendEditorApi(() => ({
        cloud: {
          a: () => 'a',
        },
      }))
      .extendEditorApi(() => ({
        cloud: {
          b: () => 'b',
        },
      }));

    const editor = createBaseEditor({
      plugins: [basePlugin],
    });

    expect(editor.api.cloud.a()).toBe('a');
    expect(editor.api.cloud.b()).toBe('b');
  });

  it('distinguish between editor.api and plugin.api', () => {
    const plugin1 = createBasePlugin({
      key: 'plugin1',
    })
      .extendEditorApi(() => ({
        method: () => 'plugin1' as string,
        scoped: () => 'scoped1' as string,
      }))
      .extendApi(() => ({ scoped: () => 'plugin-scoped1' as string }))
      .extendEditorApi(({ api, editor }) => {
        const currentScoped = api.scoped;

        return {
          method: () => 'plugin2',
          scoped: () => 'scoped2',
          testMethod: () => {
            // This should access the overridden editor.api.method
            const editorMethod = editor.api.method();

            return `${editorMethod}-${currentScoped()}`;
          },
        };
      });

    const plugin3 = createBasePlugin({
      key: 'plugin3',
    }).extendEditorApi(() => ({
      method: () => 'plugin3',
    }));

    const editor = createBaseEditor({
      plugins: [plugin1, plugin3],
    });

    expect(editor.api.method()).toBe('plugin3'); // Overridden by plugin2
    expect(getEditorPlugin(editor, plugin1).api.scoped()).toBe(
      'plugin-scoped1'
    );
    expect(editor.api.testMethod()).toBe('plugin3-plugin-scoped1');
  });

  it('comprehensively handles nested and overridden editor APIs', () => {
    const basePlugin = createBasePlugin({
      key: 'testPlugin',
      options: {
        baseValue: 10,
      },
    })
      .extendEditorApi(({ getOptions }) => ({
        level1: {
          method1: () => getOptions().baseValue,
          method2: (factor: number) => getOptions().baseValue * factor,
        },
        standalone: () => 'base',
      }))
      .extendEditorApi(({ editor }) => ({
        level1: {
          method3: () =>
            editor.api.level1.method1() + editor.api.level1.method2(2),
        },
        override: () => 'original',
      }))
      .extendEditorApi(({ editor, getOptions }) => ({
        combined: () => editor.api.level1.method3() + getOptions().baseValue,
      }));

    const overridePlugin = createBasePlugin({
      dependencies: [basePlugin],
      key: 'overridePlugin',
    }).extendEditorApi(({ editor }) => ({
      override: () => `overridden: ${editor.api.standalone()}`,
    }));

    const editor = createBaseEditor({
      plugins: [basePlugin, overridePlugin],
    });

    expect(editor.api.level1.method1()).toBe(10);
    expect(editor.api.level1.method2(3)).toBe(30);
    expect(editor.api.level1.method3()).toBe(30);

    expect(editor.api.standalone()).toBe('base');

    expect(editor.api.combined()).toBe(40);

    // @ts-expect-error editor-level override APIs must not keep stale first-plugin literals
    const staleOverrideLiteral: 'original' = editor.api.override();
    void staleOverrideLiteral;

    expect(editor.api.override()).toBe('overridden: base');

    const context = editor.plugin(basePlugin);

    // @ts-expect-error root editor APIs do not leak into plugin portals
    expect(context.api.level1).toBeUndefined();
    expect(Object.isFrozen(editor.api.level1)).toBe(true);
    expect(() => {
      editor.api.level1.method1 = () => 100;
    }).toThrow();

    context.setOption('baseValue', 20);
    expect(editor.api.level1.method1()).toBe(20);
    expect(editor.plugins.testPlugin.options.baseValue).toBe(10);
  });
});

describe('extendApi method', () => {
  it('keeps descriptor declarations separate from the installed plugin portal', () => {
    const testPlugin = createBasePlugin({
      api: {
        rootMethod: () => 'root',
      },
      key: 'testPlugin',
    })
      .extend({
        api: {
          testPlugin: {
            sameKeyRootMethod: () => 'same-key-root',
          },
        },
      })
      .extendApi(() => ({
        pluginMethod: () => 'plugin',
      }));

    expect(Object.hasOwn(testPlugin, 'api')).toBe(false);
    expect(Reflect.get(testPlugin, 'api')).toBeUndefined();

    const editor = createBaseEditor({ plugins: [testPlugin] });

    expect(editor.api.rootMethod()).toBe('root');
    expect(editor.api.testPlugin.sameKeyRootMethod()).toBe('same-key-root');
    expect(editor.plugin(testPlugin).api.pluginMethod()).toBe('plugin');
    expect(Reflect.get(editor.plugin(testPlugin).api, 'rootMethod')).toBe(
      undefined
    );
  });

  it('extend plugin-specific API without affecting global API', () => {
    const testPlugin = createBasePlugin({
      key: 'testPlugin',
    })
      .extendEditorApi(() => ({
        globalMethod: () => 'global',
      }))
      .extendApi(() => ({
        pluginMethod: () => 'plugin',
      }));

    const editor = createBaseEditor({
      plugins: [testPlugin],
    });

    expect(editor.api.globalMethod()).toBe('global');
    expect(editor.plugin(testPlugin).api.pluginMethod()).toBe('plugin');
    expect(Reflect.get(editor.api, 'testPlugin')).toBeUndefined();

    // @ts-expect-error plugin-specific APIs do not leak into editor.api
    const pluginMethod = editor.api.pluginMethod;
    expect(pluginMethod).toBeUndefined();
  });

  it('allow multiple extendApi calls', () => {
    const testPlugin = createBasePlugin({
      key: 'testPlugin',
    })
      .extendApi(() => ({
        method1: () => 1,
      }))
      .extendApi(() => ({
        method2: () => 2,
      }))
      .extendApi(({ api }) => ({
        method3: () => api.method1() + api.method2(),
      }));

    const editor = createBaseEditor({
      plugins: [testPlugin],
    });

    expect(editor.plugin(testPlugin).api.method1()).toBe(1);
    expect(editor.plugin(testPlugin).api.method2()).toBe(2);
    expect(editor.plugin(testPlugin).api.method3()).toBe(3);
  });

  it('allow access to plugin options in extendApi', () => {
    const testPlugin = createBasePlugin({
      key: 'testPlugin',
      options: {
        baseValue: 10,
      },
    }).extendApi(({ getOptions }) => ({
      getValue: () => getOptions().baseValue,
    }));

    const editor = createBaseEditor({
      plugins: [testPlugin],
    });

    expect(editor.plugin(testPlugin).api.getValue()).toBe(10);
  });

  it('allow interaction between global and plugin-specific APIs', () => {
    const testPlugin = createBasePlugin({
      key: 'testPlugin',
    })
      .extendEditorApi(() => ({
        globalMethod: () => 5,
      }))
      .extendApi(({ editor }) => ({
        pluginMethod: () => editor.api.globalMethod() * 2,
      }));

    const editor = createBaseEditor({
      plugins: [testPlugin],
    });

    expect(editor.plugin(testPlugin).api.pluginMethod()).toBe(10);
  });

  it('maintain separate contexts for different plugins', () => {
    const plugin1 = createBasePlugin({
      key: 'plugin1',
    }).extendApi(() => ({
      method: () => 'plugin1',
    }));

    const plugin2 = createBasePlugin({
      key: 'plugin2',
    }).extendApi(() => ({
      method: () => 'plugin2',
    }));

    const editor = createBaseEditor({
      plugins: [plugin1, plugin2],
    });

    expect(editor.plugin(plugin1).api.method()).toBe('plugin1');
    expect(editor.plugin(plugin2).api.method()).toBe('plugin2');
  });

  it('allow overriding plugin-specific APIs', () => {
    const basePlugin = createBasePlugin({
      key: 'basePlugin',
    }).extendApi(() => ({
      method: () => 'base',
    }));

    const overridePlugin = createBasePlugin({
      key: 'overridePlugin',
    }).extendApi(({ editor }) => {
      const baseApi = getEditorPlugin(editor, basePlugin).api;

      return {
        method: () => `override ${baseApi.method()}`,
      };
    });

    const editor = createBaseEditor({
      plugins: [basePlugin, overridePlugin],
    });

    expect(editor.plugin(basePlugin).api.method()).toBe('base');
    expect(editor.plugin(overridePlugin).api.method()).toBe('override base');
  });

  it('handle complex scenarios with both extendEditorApi and extendApi', () => {
    const testPlugin = createBasePlugin({
      key: 'testPlugin',
      options: {
        baseValue: 5,
      },
    })
      .extendEditorApi(() => ({
        globalMethod: () => 'global',
      }))
      .extendApi(({ getOptions }) => ({
        pluginMethod: () => getOptions().baseValue,
      }))
      .extendEditorApi(({ api, editor }) => ({
        combinedMethod: () =>
          `${editor.api.globalMethod()}-${api.pluginMethod()}`,
      }));

    const editor = createBaseEditor({
      plugins: [testPlugin],
    });

    expect(editor.api.globalMethod()).toBe('global');
    expect(editor.plugin(testPlugin).api.pluginMethod()).toBe(5);
    expect(editor.api.combinedMethod()).toBe('global-5');
  });
});
