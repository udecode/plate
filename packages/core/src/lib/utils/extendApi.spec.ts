import { createSlateEditor } from '../editor';
import {
  type PluginConfig,
  createSlatePlugin,
  createTSlatePlugin,
  getSlatePlugin,
} from '../plugin';

const createPluginEditor = (
  plugins: Parameters<typeof createSlateEditor>[0]['plugins']
) => createSlateEditor({ plugins });

describe('extendEditorApi method', () => {
  it('maintain editor and plugin API reference while extending', () => {
    let api1: any;
    let pluginApi1: any;

    const editor = createPluginEditor([
      createSlatePlugin({
        key: 'testPlugin',
      })
        .extendEditorApi(({ editor, plugin }) => {
          api1 = editor.getApi({} as any);
          pluginApi1 = plugin.api;

          return { method1: () => 1 };
        })
        .extendEditorApi(({ editor, plugin: { api } }) => {
          expect(api1).toBe(editor.getApi({} as any));
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

    const customPlugin = createTSlatePlugin<CustomConfig>({
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
    const basePlugin = createSlatePlugin({
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
    const basePlugin = createSlatePlugin({
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
    const testPlugin = createSlatePlugin({
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
      createSlatePlugin({
        key: 'another',
      }).extendEditorApi(({ editor }) => ({
        method4: () => {
          const api = editor.getApi(testPlugin);

          return api.method3();
        },
      })),
    ]);

    expect(editor.api.method4()).toBe(3);
  });

  it('allow stable plugin api', () => {
    const testPlugin = createSlatePlugin({
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
      createSlatePlugin({ key: 'another' }).extendEditorApi(({ editor }) => {
        const api = editor.getApi(testPlugin);

        return {
          method4: () => api.method3(),
        };
      }),
    ]);

    expect(editor.api.method4()).toBe(3);
  });

  it('allow overriding plugin APIs', () => {
    const basePlugin = createSlatePlugin({
      key: 'basePlugin',
    }).extendEditorApi(() => ({
      method: () => 'base',
    }));

    const overridePlugin = createSlatePlugin({
      key: 'overridePlugin',
    }).extendEditorApi(({ editor }) => {
      const { method } = editor.getApi(basePlugin);

      return {
        method: () => `override ${method()}`,
      };
    });

    const editor = createPluginEditor([basePlugin, overridePlugin]);

    expect(editor.api.method()).toBe('override base' as any);
  });

  it('merge nested API properties', () => {
    const basePlugin = createSlatePlugin({ key: 'nestedPlugin' })
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
    const plugin1 = createSlatePlugin({
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

    const plugin3 = createSlatePlugin({
      key: 'plugin3',
    }).extendEditorApi(() => ({
      method: () => 'plugin3',
    }));

    const editor = createPluginEditor([plugin1, plugin3]);

    expect(editor.api.method()).toBe('plugin3'); // Overridden by plugin2
    expect(getSlatePlugin(editor, plugin1).api.scoped()).toBe('scoped2'); // From plugin1, not overridden
    expect(editor.api.testMethod()).toBe('plugin3-scoped1');
  });

  it('comprehensively handle all aspects of extendEditorApi and extendEditorTransforms', () => {
    const basePlugin = createSlatePlugin({
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
      .extendEditorTransforms(({ getOptions }) => ({
        transform1: (amount: number) => getOptions().baseValue + amount,
      }))
      .extendEditorTransforms(({ plugin: { transforms } }) => ({
        transform2: () => transforms.transform1(5) * 2,
      }))
      .extendEditorApi(({ plugin: { api, transforms } }) => ({
        combined: () => api.level1.method3() + transforms.transform2(),
      }));

    const overridePlugin = createSlatePlugin({
      key: 'overridePlugin',
    }).extendEditorApi(({ editor }) => {
      const baseApi = editor.getApi(basePlugin);

      return {
        override: () => `overridden: ${baseApi.standalone()}`,
      };
    });

    const editor = createPluginEditor([basePlugin, overridePlugin]);

    expect(editor.api.level1.method1()).toBe(10);
    expect(editor.api.level1.method2(3)).toBe(30);
    expect(editor.api.level1.method3()).toBe(30);

    expect(editor.api.standalone()).toBe('base');

    expect(editor.transforms.transform1(5)).toBe(15);
    expect(editor.transforms.transform2()).toBe(30);

    expect(editor.api.combined()).toBe(60);

    expect(editor.api.override()).toBe('overridden: base' as any);

    const plugin = getSlatePlugin(editor, basePlugin);
    expect(plugin.api.level1.method1()).toBe(10);
    expect(plugin.transforms.transform1(5)).toBe(15);

    plugin.api.level1.method1 = () => 100;
    expect(plugin.api.level1.method1()).toBe(100);
    expect(editor.api.level1.method1()).toBe(10);

    editor.plugins.testPlugin.options.baseValue = 20;
    expect(editor.api.level1.method1()).toBe(20);
    expect(editor.transforms.transform1(5)).toBe(25);
  });
});

describe('extendApi method', () => {
  it('extend plugin-specific API without affecting global API', () => {
    const testPlugin = createSlatePlugin({
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
    const testPlugin = createSlatePlugin({
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
    const testPlugin = createSlatePlugin({
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
    const testPlugin = createSlatePlugin({
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
    const plugin1 = createSlatePlugin({
      key: 'plugin1',
    }).extendApi(() => ({
      method: () => 'plugin1',
    }));

    const plugin2 = createSlatePlugin({
      key: 'plugin2',
    }).extendApi(() => ({
      method: () => 'plugin2',
    }));

    const editor = createPluginEditor([plugin1, plugin2]);

    expect(editor.api.plugin1.method()).toBe('plugin1');
    expect(editor.api.plugin2.method()).toBe('plugin2');
  });

  it('allow overriding plugin-specific APIs', () => {
    const basePlugin = createSlatePlugin({
      key: 'basePlugin',
    }).extendApi(() => ({
      method: () => 'base',
    }));

    const overridePlugin = createSlatePlugin({
      key: 'overridePlugin',
    }).extendApi(({ editor }) => {
      const baseApi = editor.getApi(basePlugin);

      return {
        method: () => `override ${baseApi.basePlugin.method()}`,
      };
    });

    const editor = createPluginEditor([basePlugin, overridePlugin]);

    expect(editor.api.basePlugin.method()).toBe('base');
    expect(editor.api.overridePlugin.method()).toBe('override base');
  });

  it('handle complex scenarios with both extendEditorApi and extendApi', () => {
    const testPlugin = createSlatePlugin({
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

describe('extendTransforms method', () => {
  it('extend plugin-specific transforms without affecting global transforms', () => {
    const testPlugin = createSlatePlugin({
      key: 'testPlugin',
    })
      .extendEditorTransforms(() => ({
        globalTransform: () => 'global',
      }))
      .extendTransforms(() => ({
        pluginTransform: () => 'plugin',
      }));

    const editor = createPluginEditor([testPlugin]);

    expect(editor.transforms.globalTransform()).toBe('global');
    expect(editor.transforms.testPlugin.pluginTransform()).toBe('plugin');

    // @ts-expect-error
    expect(editor.transforms.pluginTransform).toBeUndefined();
  });

  it('allow multiple extendTransforms calls', () => {
    const testPlugin = createSlatePlugin({
      key: 'testPlugin',
    })
      .extendTransforms(() => ({
        transform1: () => 1,
      }))
      .extendTransforms(() => ({
        transform2: () => 2,
      }))
      .extendTransforms(({ tf }) => ({
        transform3: () =>
          tf.testPlugin.transform1() + tf.testPlugin.transform2(),
      }));

    const editor = createPluginEditor([testPlugin]);

    expect(editor.transforms.testPlugin.transform1()).toBe(1);
    expect(editor.transforms.testPlugin.transform2()).toBe(2);
    expect(editor.transforms.testPlugin.transform3()).toBe(3);
    expect(editor.tf.testPlugin.transform1()).toBe(1);
    expect(editor.tf.testPlugin.transform2()).toBe(2);
    expect(editor.tf.testPlugin.transform3()).toBe(3);
  });

  it('allow interaction between global and plugin-specific transforms', () => {
    const testPlugin = createSlatePlugin({
      key: 'testPlugin',
    })
      .extendEditorTransforms(() => ({
        globalTransform: () => 5,
      }))
      .extendTransforms(({ tf }) => ({
        pluginTransform: () => tf.globalTransform() * 2,
      }));

    const editor = createPluginEditor([testPlugin]);

    expect(editor.transforms.testPlugin.pluginTransform()).toBe(10);
  });
});
