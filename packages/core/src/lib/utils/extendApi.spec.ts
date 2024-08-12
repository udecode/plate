import { createPlateEditor } from '../../react';
import { createPlugin, getEditorApi, getPluginOptions } from '../plugin';

describe('extendApi method', () => {
  it('should maintain editor and plugin API reference while extending', () => {
    let api1: any;
    let pluginApi1: any;

    const editor = createPlateEditor({
      plugins: [
        createPlugin({
          key: 'testPlugin',
        })
          .extendApi(({ editor, plugin: { api } }) => {
            api1 = getEditorApi(editor, {} as any);
            pluginApi1 = api;

            return { method1: () => 1 };
          })
          .extendApi(({ editor, plugin: { api } }) => {
            expect(api1).toBe(getEditorApi(editor, {} as any)); // The reference should be the same
            expect(pluginApi1).toBe(api); // The reference should be the same

            return { method2: () => 2 };
          }),
      ],
    });

    expect(editor.api.method2).toBeDefined(); // The new method should be available
    expect(editor.api.method2()).toBe(2);
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
        sampleMethod: () => options.baseValue + 1,
      }))
      .extend({
        options: {
          baseValue: 20,
        },
      })
      .extendApi(({ plugin: { api, options } }) => ({
        anotherMethod: () => (api as any).sampleMethod() + options.baseValue,
      }))
      .configure({
        baseValue: 25,
      });

    const editor = createPlateEditor({
      plugins: [extendedPlugin],
    });

    expect(getPluginOptions(editor, extendedPlugin).baseValue).toBe(25);
    expect(editor.api.sampleMethod()).toBe(26);
    expect(editor.api.anotherMethod()).toBe(51);
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

  it('should allow getPluginApi', () => {
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
            const api = getEditorApi(editor, testPlugin);

            return api.method3();
          },
        })),
      ],
    });

    expect(editor.api.method4()).toBe(3);
  });

  it('should allow stable getPluginApi', () => {
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
          const api = getEditorApi(editor, testPlugin);

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
      const { method } = getEditorApi(editor, basePlugin);

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
});
