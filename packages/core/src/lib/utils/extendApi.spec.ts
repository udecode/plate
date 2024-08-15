import { createPlateEditor } from '../../react';
import {
  type PluginConfig,
  createPlugin,
  createTPlugin,
  getPlugin,
} from '../plugin';

describe('extendApi method', () => {
  it('should maintain editor and plugin API reference while extending', () => {
    let api1: any;
    let pluginApi1: any;

    const editor = createPlateEditor({
      plugins: [
        createPlugin({
          key: 'testPlugin',
        })
          .extendApi(({ editor, plugin }) => {
            api1 = editor.getApi({} as any);
            pluginApi1 = plugin.api;

            return { method1: () => 1 };
          })
          .extendApi(({ editor, plugin: { api } }) => {
            expect(api1).toBe(editor.getApi({} as any)); // The reference should be the same
            expect(pluginApi1).toBe(api); // The reference should be the same

            return { method2: () => 2 };
          }),
      ],
    });

    expect(editor.api.method2).toBeDefined(); // The new method should be available
    expect(editor.api.method2()).toBe(2);
  });

  it('should correctly handle extendApi with function parameters', () => {
    type CustomConfig = PluginConfig<
      'customPlugin',
      { baseValue: number },
      { multiply: (factor: number) => number }
    >;

    const customPlugin = createTPlugin<CustomConfig>({
      key: 'customPlugin',
      options: {
        baseValue: 5,
      },
    });

    const extendedPlugin = customPlugin.extendApi(
      ({ plugin: { options } }) => ({
        multiply: (factor) => options.baseValue * factor,
      })
    );

    const furtherExtendedPlugin = extendedPlugin.extendApi(
      ({ plugin: { api, options } }) => ({
        getTotal: (factor: number) => api.multiply(factor) + options.baseValue,
        increment: (amount: number) => {
          options.baseValue += amount;
        },
      })
    );

    const editor = createPlateEditor({
      plugins: [furtherExtendedPlugin],
    });

    expect(editor.plugins.customPlugin.options.baseValue).toBe(5);
    expect(editor.api.multiply(3)).toBe(15);

    editor.api.increment(2);
    expect(editor.plugins.customPlugin.options.baseValue).toBe(7);

    expect(editor.api.getTotal(3)).toBe(28); // (7 * 3) + 7
  });

  it('should correctly handle api extensions through extend, extendApi, and configure', () => {
    const basePlugin = createPlugin({
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
      .extendApi(({ plugin: { options } }) => ({
        sampleMethod: (inc: number) => options.baseValue + inc,
      }))
      .extend({
        options: {
          baseValue: 20,
        },
      })
      .extendApi(({ plugin: { api, options } }) => ({
        anotherMethod: () => api.sampleMethod(1) + options.baseValue,
      }));

    const editor = createPlateEditor({
      plugins: [extendedPlugin],
    });

    expect(editor.getOptions(extendedPlugin).baseValue).toBe(20);
    expect(editor.api.sampleMethod(1)).toBe(21);
    expect(editor.api.anotherMethod()).toBe(41);
  });

  it('should allow multiple extendApi calls', () => {
    const basePlugin = createPlugin({
      key: 'testPlugin',
      options: {
        baseValue: 10,
      },
    });

    const extendedPlugin = basePlugin
      .extendApi(() => ({
        method1: () => 1,
      }))
      .extendApi(() => ({
        method2: () => 2,
      }))
      .extendApi(({ plugin: { api } }) => ({
        method3: () => (api as any).method1() + (api as any).method2(),
      }));

    const editor = createPlateEditor({
      plugins: [extendedPlugin],
    });

    expect(editor.api.method1()).toBe(1);
    expect(editor.api.method2()).toBe(2);
    expect(editor.api.method3()).toBe(3);
  });

  it('should allow plugin api', () => {
    const testPlugin = createPlugin({
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
      .extendApi(({ plugin: { api } }) => ({
        method3: () => api.method1() + api.method2(),
      }));

    const editor = createPlateEditor({
      plugins: [
        testPlugin,
        createPlugin({
          key: 'another',
        }).extendApi(({ editor }) => ({
          method4: () => {
            const api = editor.getApi(testPlugin);

            return api.method3();
          },
        })),
      ],
    });

    expect(editor.api.method4()).toBe(3);
  });

  it('should allow stable plugin api', () => {
    const testPlugin = createPlugin({
      key: 'testPlugin',
      options: { baseValue: 10 },
    })
      .extendApi(() => ({ method1: () => 1 }))
      .extendApi(() => ({ method2: () => 2 }))
      .extendApi(({ plugin: { api } }) => ({
        method3: () => api.method1() + api.method2(),
      }));

    const editor = createPlateEditor({
      plugins: [
        testPlugin,
        createPlugin({ key: 'another' }).extendApi(({ editor }) => {
          const api = editor.getApi(testPlugin);

          return {
            method4: () => {
              return api.method3();
            },
          };
        }),
      ],
    });

    expect(editor.api.method4()).toBe(3);
  });

  it('should allow overriding plugin APIs', () => {
    const basePlugin = createPlugin({
      key: 'basePlugin',
    }).extendApi(() => ({
      method: () => 'base',
    }));

    const overridePlugin = createPlugin({
      key: 'overridePlugin',
    }).extendApi(({ editor }) => {
      const { method } = editor.getApi(basePlugin);

      return {
        method: () => `override ${method()}`,
      };
    });

    const editor = createPlateEditor({
      plugins: [basePlugin, overridePlugin],
    });

    expect(editor.api.method()).toBe('override base');
  });

  it('should merge nested API properties', () => {
    const basePlugin = createPlugin({ key: 'nestedPlugin' })
      .extendApi(() => ({
        cloud: {
          a: () => 'a',
        },
      }))
      .extendApi(() => ({
        cloud: {
          b: () => 'b',
        },
      }));

    const editor = createPlateEditor({
      plugins: [basePlugin],
    });

    expect(editor.api.cloud.a()).toBe('a');
    expect(editor.api.cloud.b()).toBe('b');
  });

  it('should distinguish between editor.api and plugin.api', () => {
    const plugin1 = createPlugin({
      key: 'plugin1',
    })
      .extendApi(() => ({
        method: () => 'plugin1' as string,
        scoped: () => 'scoped1' as string,
      }))
      .extendApi(({ api, plugin }) => {
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

    const plugin3 = createPlugin({
      key: 'plugin3',
    }).extendApi(() => ({
      method: () => 'plugin3',
    }));

    const editor = createPlateEditor({
      plugins: [plugin1, plugin3],
    });

    expect(editor.api.method()).toBe('plugin3'); // Overridden by plugin2
    expect(getPlugin(editor, plugin1).api.scoped()).toBe('scoped2'); // From plugin1, not overridden
    expect(editor.api.testMethod()).toBe('plugin3-scoped1');
  });

  it('should comprehensively handle all aspects of extendApi and extendTransforms', () => {
    const basePlugin = createPlugin({
      key: 'testPlugin',
      options: {
        baseValue: 10,
      },
    })
      .extendApi(({ plugin: { options } }) => ({
        level1: {
          method1: () => options.baseValue,
          method2: (factor: number) => options.baseValue * factor,
        },
        standalone: () => 'base',
      }))
      .extendApi(({ plugin: { api } }) => ({
        level1: {
          method3: () => api.level1.method1() + api.level1.method2(2),
        },
        override: () => 'original',
      }))
      .extendTransforms(({ plugin: { options } }) => ({
        transform1: (_: any, amount: number) => options.baseValue + amount,
      }))
      .extendTransforms(({ plugin: { transforms } }) => ({
        transform2: (editor: any) => transforms.transform1(editor, 5) * 2,
      }))
      .extendApi(({ plugin: { api, transforms } }) => ({
        combined: () => api.level1.method3() + transforms.transform2(editor),
      }));

    const overridePlugin = createPlugin({
      key: 'overridePlugin',
    }).extendApi(({ editor }) => {
      const baseApi = editor.getApi(basePlugin);

      return {
        override: () => `overridden: ${baseApi.standalone()}`,
      };
    });

    const editor = createPlateEditor({
      plugins: [basePlugin, overridePlugin],
    });

    // Test nested API methods
    expect(editor.api.level1.method1()).toBe(10);
    expect(editor.api.level1.method2(3)).toBe(30);
    expect(editor.api.level1.method3()).toBe(30); // 10 + (10 * 2)

    // Test standalone method
    expect(editor.api.standalone()).toBe('base');

    // Test transforms
    expect(editor.transforms.transform1(5)).toBe(15);
    expect(editor.transforms.transform2()).toBe(30); // (10 + 5) * 2

    // Test combined API and transform method
    expect(editor.api.combined()).toBe(60); // 40 + 20

    // Test method overriding
    expect(editor.api.override()).toBe('overridden: base');

    // Test that transforms and API methods are also available in the plugin
    const plugin = getPlugin(editor, basePlugin);
    expect(plugin.api.level1.method1()).toBe(10);
    expect(plugin.transforms.transform1(5)).toBe(15);

    // Test that editor.api and plugin.api are distinct
    plugin.api.level1.method1 = () => 100;
    expect(plugin.api.level1.method1()).toBe(100);
    expect(editor.api.level1.method1()).toBe(10); // Unchanged

    // Test that options are correctly bound
    editor.plugins.testPlugin.options.baseValue = 20;
    expect(editor.api.level1.method1()).toBe(20);
    expect(editor.transforms.transform1(5)).toBe(25);
  });
});
