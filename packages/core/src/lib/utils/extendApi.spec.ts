import { createBasePlateEditor } from '../editor';
import {
  type PluginConfig,
  createEditorPlugin,
  getEditorPlugin,
} from '../plugin';

const createPluginEditor = (
  plugins: Parameters<typeof createBasePlateEditor>[0]['plugins']
) => createBasePlateEditor({ plugins });

describe('extendEditorApi method', () => {
  it('maintain editor and plugin API reference while extending', () => {
    let api1: any;
    let pluginApi1: any;

    const editor = createPluginEditor([
      createEditorPlugin({
        key: 'testPlugin',
      })
        .extendEditorApi(({ editor, plugin }) => {
          api1 = editor.api;
          pluginApi1 = plugin.api;

          return { method1: () => 1 };
        })
        .extendEditorApi(({ editor, plugin: { api } }) => {
          expect(api1).toBe(editor.api);
          expect(pluginApi1).toBe(api);

          return { method2: () => 2 };
        }),
    ]);

    expect(editor.api.method2).toBeDefined();
    expect(editor.api.method2()).toBe(2);
  });

  it('correctly handle extendEditorApi with function parameters', () => {
    type CustomConfig = PluginConfig<
      'customPlugin',
      { baseValue: number },
      { multiply: (factor: number) => number }
    >;

    const customPlugin = createEditorPlugin<CustomConfig>({
      key: 'customPlugin',
      options: {
        baseValue: 5,
      },
    });

    const extendedPlugin = customPlugin.extendEditorApi(({ getOptions }) => ({
      multiply: (factor) => getOptions().baseValue * factor,
    }));

    const furtherExtendedPlugin = extendedPlugin.extendEditorApi(
      ({ plugin: { api, options } }) => ({
        getTotal: (factor: number) => api.multiply(factor) + options.baseValue,
        increment: (amount: number) => {
          options.baseValue += amount;
        },
      })
    );

    const editor = createPluginEditor([furtherExtendedPlugin]);

    expect(editor.plugins.customPlugin.options.baseValue).toBe(5);
    expect(editor.api.multiply(3)).toBe(15);

    editor.api.increment(2);
    expect(editor.plugins.customPlugin.options.baseValue).toBe(7);

    expect(editor.api.getTotal(3)).toBe(28); // (7 * 3) + 7
  });

  it('correctly handle api extensions through extend, extendEditorApi, and configure', () => {
    const basePlugin = createEditorPlugin({
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
      .extendEditorApi(({ plugin: { api, options } }) => ({
        anotherMethod: () => api.sampleMethod(1) + options.baseValue,
      }));

    const editor = createPluginEditor([extendedPlugin]);

    expect(editor.getOptions(extendedPlugin).baseValue).toBe(20);
    expect(editor.api.sampleMethod(1)).toBe(21);
    expect(editor.api.anotherMethod()).toBe(41);
  });

  it('allow multiple extendEditorApi calls', () => {
    const basePlugin = createEditorPlugin({
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
      .extendEditorApi(({ plugin: { api } }) => ({
        method3: () => (api as any).method1() + (api as any).method2(),
      }));

    const editor = createPluginEditor([extendedPlugin]);

    expect(editor.api.method1()).toBe(1);
    expect(editor.api.method2()).toBe(2);
    expect(editor.api.method3()).toBe(3);
  });

  it('allow plugin api', () => {
    const testPlugin = createEditorPlugin({
      key: 'testPlugin',
      options: {
        baseValue: 10,
      },
    })
      .extendEditorApi(() => ({
        method1: () => 1,
      }))
      .extendEditorApi(() => ({
        method2: () => 2,
      }))
      .extendEditorApi(({ plugin: { api } }) => ({
        method3: () => api.method1() + api.method2(),
      }));

    const editor = createPluginEditor([
      testPlugin,
      createEditorPlugin({
        key: 'another',
      }).extendEditorApi(({ editor }) => ({
        method4: () =>
          (
            editor.api as typeof editor.api & {
              method3: () => number;
            }
          ).method3(),
      })),
    ]);

    expect(editor.api.method4()).toBe(3);
  });

  it('allow stable plugin api', () => {
    const testPlugin = createEditorPlugin({
      key: 'testPlugin',
      options: { baseValue: 10 },
    })
      .extendEditorApi(() => ({ method1: () => 1 }))
      .extendEditorApi(() => ({ method2: () => 2 }))
      .extendEditorApi(({ plugin: { api } }) => ({
        method3: () => api.method1() + api.method2(),
      }));

    const editor = createPluginEditor([
      testPlugin,
      createEditorPlugin({ key: 'another' }).extendEditorApi(({ editor }) => {
        const api = editor.api as typeof editor.api & {
          method3: () => number;
        };

        return {
          method4: () => api.method3(),
        };
      }),
    ]);

    expect(editor.api.method4()).toBe(3);
  });

  it('allow overriding plugin APIs', () => {
    const basePlugin = createEditorPlugin({
      key: 'basePlugin',
    }).extendEditorApi(() => ({
      method: () => 'base',
    }));

    const overridePlugin = createEditorPlugin({
      key: 'overridePlugin',
    }).extendEditorApi(({ editor }) => {
      const { method } = editor.api as typeof editor.api & {
        method: () => string;
      };

      return {
        method: () => `override ${method()}`,
      };
    });

    const editor = createPluginEditor([basePlugin, overridePlugin]);

    expect(editor.api.method()).toBe('override base' as any);
  });

  it('merge nested API properties', () => {
    const basePlugin = createEditorPlugin({ key: 'nestedPlugin' })
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

    const editor = createPluginEditor([basePlugin]);

    expect(editor.api.cloud.a()).toBe('a');
    expect(editor.api.cloud.b()).toBe('b');
  });

  it('distinguish between editor.api and plugin.api', () => {
    const plugin1 = createEditorPlugin({
      key: 'plugin1',
    })
      .extendEditorApi(() => ({
        method: () => 'plugin1' as string,
        scoped: () => 'scoped1' as string,
      }))
      .extendEditorApi(({ api, plugin }) => {
        // This should access the current plugin's scoped api method
        const currentScoped = plugin.api.scoped;

        return {
          method: () => 'plugin2',
          scoped: () => 'scoped2',
          testMethod: () => {
            // This should access the overridden editor.api.method
            const editorMethod = api.method();

            return `${editorMethod}-${currentScoped()}`;
          },
        };
      });

    const plugin3 = createEditorPlugin({
      key: 'plugin3',
    }).extendEditorApi(() => ({
      method: () => 'plugin3',
    }));

    const editor = createPluginEditor([plugin1, plugin3]);

    expect(editor.api.method()).toBe('plugin3'); // Overridden by plugin2
    expect(getEditorPlugin(editor, plugin1).api.scoped()).toBe('scoped2'); // From plugin1, not overridden
    expect(editor.api.testMethod()).toBe('plugin3-scoped1');
  });

  it('comprehensively handles nested and overridden editor APIs', () => {
    const basePlugin = createEditorPlugin({
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
      .extendEditorApi(({ plugin: { api } }) => ({
        level1: {
          method3: () => api.level1.method1() + api.level1.method2(2),
        },
        override: () => 'original',
      }))
      .extendEditorApi(({ getOptions, plugin: { api } }) => ({
        combined: () => api.level1.method3() + getOptions().baseValue,
      }));

    const overridePlugin = createEditorPlugin({
      key: 'overridePlugin',
    }).extendEditorApi(({ editor }) => {
      const baseApi = editor.api as typeof editor.api & {
        standalone: () => string;
      };

      return {
        override: () => `overridden: ${baseApi.standalone()}`,
      };
    });

    const editor = createPluginEditor([basePlugin, overridePlugin]);

    expect(editor.api.level1.method1()).toBe(10);
    expect(editor.api.level1.method2(3)).toBe(30);
    expect(editor.api.level1.method3()).toBe(30);

    expect(editor.api.standalone()).toBe('base');

    expect(editor.api.combined()).toBe(40);

    expect(editor.api.override()).toBe('overridden: base' as any);

    const plugin = editor.getPlugin(basePlugin);
    expect(plugin.api.level1.method1()).toBe(10);

    plugin.api.level1.method1 = () => 100;
    expect(plugin.api.level1.method1()).toBe(100);
    expect(editor.api.level1.method1()).toBe(10);

    editor.plugins.testPlugin.options.baseValue = 20;
    expect(editor.api.level1.method1()).toBe(20);
  });
});

describe('extendApi method', () => {
  it('extend plugin-specific API without affecting global API', () => {
    const testPlugin = createEditorPlugin({
      key: 'testPlugin',
    })
      .extendEditorApi(() => ({
        globalMethod: () => 'global',
      }))
      .extendApi(() => ({
        pluginMethod: () => 'plugin',
      }));

    const editor = createPluginEditor([testPlugin]);

    expect(editor.api.globalMethod()).toBe('global');
    expect(editor.api.testPlugin.pluginMethod()).toBe('plugin');

    // @ts-expect-error
    expect(editor.api.pluginMethod).toBeUndefined();
  });

  it('allow multiple extendApi calls', () => {
    const testPlugin = createEditorPlugin({
      key: 'testPlugin',
    })
      .extendApi(() => ({
        method1: () => 1,
      }))
      .extendApi(() => ({
        method2: () => 2,
      }))
      .extendApi(({ api }) => ({
        method3: () => api.testPlugin.method1() + api.testPlugin.method2(),
      }));

    const editor = createPluginEditor([testPlugin]);

    expect(editor.api.testPlugin.method1()).toBe(1);
    expect(editor.api.testPlugin.method2()).toBe(2);
    expect(editor.api.testPlugin.method3()).toBe(3);
  });

  it('allow access to plugin options in extendApi', () => {
    const testPlugin = createEditorPlugin({
      key: 'testPlugin',
      options: {
        baseValue: 10,
      },
    }).extendApi(({ getOptions }) => ({
      getValue: () => getOptions().baseValue,
    }));

    const editor = createPluginEditor([testPlugin]);

    expect(editor.api.testPlugin.getValue()).toBe(10);
  });

  it('allow interaction between global and plugin-specific APIs', () => {
    const testPlugin = createEditorPlugin({
      key: 'testPlugin',
    })
      .extendEditorApi(() => ({
        globalMethod: () => 5,
      }))
      .extendApi(({ api }) => ({
        pluginMethod: () => api.globalMethod() * 2,
      }));

    const editor = createPluginEditor([testPlugin]);

    expect(editor.api.testPlugin.pluginMethod()).toBe(10);
  });

  it('maintain separate contexts for different plugins', () => {
    const plugin1 = createEditorPlugin({
      key: 'plugin1',
    }).extendApi(() => ({
      method: () => 'plugin1',
    }));

    const plugin2 = createEditorPlugin({
      key: 'plugin2',
    }).extendApi(() => ({
      method: () => 'plugin2',
    }));

    const editor = createPluginEditor([plugin1, plugin2]);

    expect(editor.api.plugin1.method()).toBe('plugin1');
    expect(editor.api.plugin2.method()).toBe('plugin2');
  });

  it('allow overriding plugin-specific APIs', () => {
    const basePlugin = createEditorPlugin({
      key: 'basePlugin',
    }).extendApi(() => ({
      method: () => 'base',
    }));

    const overridePlugin = createEditorPlugin({
      key: 'overridePlugin',
    }).extendApi(({ editor }) => {
      const baseApi = editor.api as typeof editor.api & {
        basePlugin: { method: () => string };
      };

      return {
        method: () => `override ${baseApi.basePlugin.method()}`,
      };
    });

    const editor = createPluginEditor([basePlugin, overridePlugin]);

    expect(editor.api.basePlugin.method()).toBe('base');
    expect(editor.api.overridePlugin.method()).toBe('override base');
  });

  it('handle complex scenarios with both extendEditorApi and extendApi', () => {
    const testPlugin = createEditorPlugin({
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
      .extendEditorApi(({ api }) => ({
        combinedMethod: () =>
          `${api.globalMethod()}-${api.testPlugin.pluginMethod()}`,
      }));

    const editor = createPluginEditor([testPlugin]);

    expect(editor.api.globalMethod()).toBe('global');
    expect(editor.api.testPlugin.pluginMethod()).toBe(5);
    expect(editor.api.combinedMethod()).toBe('global-5');
  });
});
