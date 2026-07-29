import { createBaseEditor } from '../editor';
import {
  type PluginConfig,
  createBasePlugin,
  getEditorPlugin,
} from '../plugin';

describe('plugin extension merging', () => {
  it('merges editor APIs across staged callbacks', () => {
    let extensionCalls = 0;

    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'testPlugin',
        })
          .extend(() => {
            extensionCalls++;

            return { extension: { api: { method1: () => 1 } } };
          })
          .extend(() => {
            extensionCalls++;

            return { extension: { api: { method2: () => 2 } } };
          }),
      ],
    });

    expect(extensionCalls).toBe(2);
    expect(editor.api.method1()).toBe(1);
    expect(editor.api.method2).toBeDefined();
    expect(editor.api.method2()).toBe(2);
  });

  it('contextually types root API methods with function parameters', () => {
    type CustomConfig = PluginConfig<
      'customPlugin',
      { baseValue: number },
      { multiply: (factor: number) => number }
    >;

    const customPlugin = createBasePlugin<CustomConfig>({
      key: 'customPlugin',
      initialState: {
        baseValue: 5,
      },
    });

    const extendedPlugin = customPlugin.extend(({ store }) => ({
      extension: {
        api: {
          multiply: (factor) => store.get().baseValue * factor,
        },
      },
    }));

    const furtherExtendedPlugin = extendedPlugin.extend(
      ({ editor, store }) => ({
        extension: {
          api: {
            getTotal: (factor: number) =>
              editor.api.multiply(factor) + store.get().baseValue,
            increment: (amount: number) => {
              store.set({
                baseValue: store.get().baseValue + amount,
              });
            },
          },
        },
      })
    );

    const editor = createBaseEditor({
      plugins: [furtherExtendedPlugin],
    });

    expect(editor.getPlugin(furtherExtendedPlugin).initialState.baseValue).toBe(
      5
    );
    expect(editor.api.multiply(3)).toBe(15);

    editor.api.increment(2);
    expect(editor.plugin(furtherExtendedPlugin).store.get('baseValue')).toBe(7);
    expect(editor.getPlugin(furtherExtendedPlugin).initialState.baseValue).toBe(
      5
    );

    expect(editor.api.getTotal(3)).toBe(28); // (7 * 3) + 7
  });

  it('keeps root API extensions coherent across configuration', () => {
    const basePlugin = createBasePlugin({
      key: 'testPlugin',
      initialState: {
        baseValue: 10,
      },
    });

    const extendedPlugin = basePlugin
      .extend({
        initialState: {
          baseValue: 15,
        },
      })
      .extend(({ store }) => ({
        extension: {
          api: {
            sampleMethod: (inc: number) => store.get().baseValue + inc,
          },
        },
      }))
      .extend({
        initialState: {
          baseValue: 20,
        },
      })
      .extend(({ editor, plugin: { initialState } }) => ({
        extension: {
          api: {
            anotherMethod: () =>
              editor.api.sampleMethod(1) + initialState.baseValue,
          },
        },
      }));

    const editor = createBaseEditor({
      plugins: [extendedPlugin],
    });

    expect(editor.plugin(extendedPlugin).store.get().baseValue).toBe(20);
    expect(editor.api.sampleMethod(1)).toBe(21);
    expect(editor.api.anotherMethod()).toBe(41);
  });

  it('merges root API across repeated stages', () => {
    const basePlugin = createBasePlugin({
      key: 'testPlugin',
      initialState: {
        baseValue: 10,
      },
    });

    const extendedPlugin = basePlugin
      .extend(() => ({
        extension: {
          api: {
            method1: () => 1,
          },
        },
      }))
      .extend(() => ({
        extension: {
          api: {
            method2: () => 2,
          },
        },
      }))
      .extend(({ editor }) => ({
        extension: {
          api: {
            method3: () => editor.api.method1() + editor.api.method2(),
          },
        },
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
      initialState: {
        baseValue: 10,
      },
      api: {
        method1: () => 1,
      },
    })
      .extend(() => ({
        api: {
          method2: () => 2,
        },
      }))
      .extend(({ api }) => ({
        api: {
          method3: () => api.method1() + api.method2(),
        },
      }));

    const editor = createBaseEditor({
      plugins: [
        testPlugin,
        createBasePlugin({
          key: 'another',
        }).extend(({ editor }) => ({
          extension: {
            api: {
              method4: () => getEditorPlugin(editor, testPlugin).api.method3(),
            },
          },
        })),
      ],
    });

    expect(editor.api.method4()).toBe(3);
  });

  it('allow stable plugin api', () => {
    const testPlugin = createBasePlugin({
      key: 'testPlugin',
      initialState: { baseValue: 10 },
      api: { method1: () => 1 },
    })
      .extend(() => ({ api: { method2: () => 2 } }))
      .extend(({ api }) => ({
        api: {
          method3: () => api.method1() + api.method2(),
        },
      }));

    const editor = createBaseEditor({
      plugins: [
        testPlugin,
        createBasePlugin({ key: 'another' }).extend(({ editor }) => {
          const api = getEditorPlugin(editor, testPlugin).api;

          return {
            extension: {
              api: {
                method4: () => api.method3(),
              },
            },
          };
        }),
      ],
    });

    expect(editor.api.method4()).toBe(3);
  });

  it('allow overriding plugin APIs', () => {
    const basePlugin = createBasePlugin({
      key: 'basePlugin',
      api: {
        method: () => 'base',
      },
    });

    const overridePlugin = createBasePlugin({
      key: 'overridePlugin',
    }).extend(({ editor }) => {
      const { method } = getEditorPlugin(editor, basePlugin).api;

      return {
        api: {
          method: () => `override ${method()}`,
        },
      };
    });

    const editor = createBaseEditor({
      plugins: [basePlugin, overridePlugin],
    });

    expect(editor.plugin(overridePlugin).api.method()).toBe('override base');
  });

  it('merge nested API properties', () => {
    const basePlugin = createBasePlugin({
      key: 'nestedPlugin',
      extension: {
        api: {
          cloud: {
            a: () => 'a',
          },
        },
      },
    }).extend(() => ({
      extension: {
        api: {
          cloud: {
            b: () => 'b',
          },
        },
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
      extension: {
        api: {
          method: () => 'plugin1' as string,
          scoped: () => 'scoped1' as string,
        },
      },
    })
      .extend(() => ({ api: { scoped: () => 'plugin-scoped1' as string } }))
      .extend(({ api, editor }) => {
        const currentScoped = api.scoped;

        return {
          extension: {
            api: {
              method: () => 'plugin2',
              scoped: () => 'scoped2',
              testMethod: () => {
                // This should access the overridden editor.api.method
                const editorMethod = editor.api.method();

                return `${editorMethod}-${currentScoped()}`;
              },
            },
          },
        };
      });

    const plugin3 = createBasePlugin({
      key: 'plugin3',
      extension: {
        api: {
          method: () => 'plugin3',
        },
      },
    });

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
      initialState: {
        baseValue: 10,
      },
    })
      .extend(({ store }) => ({
        extension: {
          api: {
            level1: {
              method1: () => store.get().baseValue,
              method2: (factor: number) => store.get().baseValue * factor,
            },
            standalone: () => 'base',
          },
        },
      }))
      .extend(({ editor }) => ({
        extension: {
          api: {
            level1: {
              method3: () =>
                editor.api.level1.method1() + editor.api.level1.method2(2),
            },
            override: () => 'original',
          },
        },
      }))
      .extend(({ editor, store }) => ({
        extension: {
          api: {
            combined: () => editor.api.level1.method3() + store.get().baseValue,
          },
        },
      }));

    const overridePlugin = createBasePlugin({
      dependencies: [basePlugin],
      key: 'overridePlugin',
    }).extend(({ editor }) => ({
      extension: {
        api: {
          override: () => `overridden: ${editor.api.standalone()}`,
        },
      },
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
      // @ts-expect-error Published editor APIs are immutable.
      editor.api.level1.method1 = () => 100;
    }).toThrow();

    context.store.set({ baseValue: 20 });
    expect(editor.api.level1.method1()).toBe(20);
    expect(editor.getPlugin(basePlugin).initialState.baseValue).toBe(10);
  });
});

describe('plugin-scoped API merging', () => {
  it('rejects a plugin API key that collides with an editor API namespace', () => {
    const testPlugin = createBasePlugin({
      key: 'testPlugin',
      extension: {
        api: {
          rootMethod: () => 'root',
        },
      },
    })
      .extend({
        extension: {
          api: {
            testPlugin: {
              sameKeyRootMethod: () => 'same-key-root',
            },
          },
        },
      })
      .extend(() => ({
        api: {
          pluginMethod: () => 'plugin',
        },
      }));

    expect(Object.hasOwn(testPlugin, 'api')).toBe(false);
    expect(Reflect.get(testPlugin, 'api')).toBeUndefined();

    expect(() => createBaseEditor({ plugins: [testPlugin] })).toThrow(
      'Plate API namespace "testPlugin" is declared by both plugin API and editor API owners while resolving plugin "testPlugin".'
    );
  });

  it('publishes one immutable plugin API through root and scoped access', () => {
    const testPlugin = createBasePlugin({
      key: 'testPlugin',
      extension: {
        api: {
          globalMethod: () => 'global',
        },
      },
    }).extend(() => ({
      api: {
        pluginMethod: () => 'plugin',
      },
    }));

    const editor = createBaseEditor({
      plugins: [testPlugin],
    });

    expect(editor.api.globalMethod()).toBe('global');
    expect(editor.plugin(testPlugin).api.pluginMethod()).toBe('plugin');
    expect(editor.api.testPlugin.pluginMethod()).toBe('plugin');
    expect(editor.api.testPlugin).toBe(editor.plugin(testPlugin).api);
    expect(Object.isFrozen(editor.api.testPlugin)).toBe(true);

    // @ts-expect-error plugin APIs are namespaced by plugin key
    const pluginMethod = editor.api.pluginMethod;
    expect(pluginMethod).toBeUndefined();
  });

  it('omits empty and disabled plugin API namespaces', () => {
    const emptyPlugin = createBasePlugin({ key: 'emptyPlugin' });
    const disabledPlugin = createBasePlugin({
      enabled: false,
      key: 'disabledPlugin',
      api: {
        read: () => true,
      },
    });
    const editor = createBaseEditor({
      plugins: [emptyPlugin, disabledPlugin],
    });

    expect(Reflect.has(editor.api, 'emptyPlugin')).toBe(false);
    expect(Reflect.has(editor.api, 'disabledPlugin')).toBe(false);
  });

  it('publishes only the explicit same-key replacement API', () => {
    const defaultPlugin = createBasePlugin({
      key: 'replaceablePlugin',
      api: {
        original: () => 'original',
      },
    });
    const parentPlugin = createBasePlugin({
      dependencies: [defaultPlugin],
      key: 'replacementParent',
    });
    const replacementPlugin = createBasePlugin({
      key: 'replaceablePlugin',
      api: {
        replacement: () => 'replacement',
      },
    });
    const editor = createBaseEditor({
      plugins: [parentPlugin, replacementPlugin],
    });

    expect(editor.api.replaceablePlugin.replacement()).toBe('replacement');
    expect(
      Reflect.get(editor.api.replaceablePlugin, 'original')
    ).toBeUndefined();
    expect(editor.api.replaceablePlugin).toBe(
      editor.plugin(replacementPlugin).api
    );
  });

  it('rejects a later editor API that collides with a plugin API namespace', () => {
    const pluginApiOwner = createBasePlugin({
      key: 'sharedNamespace',
      api: {
        read: () => 'plugin',
      },
    });
    const editorApiOwner = createBasePlugin({
      key: 'editorApiOwner',
      extension: {
        api: {
          sharedNamespace: {
            read: () => 'editor',
          },
        },
      },
    });

    expect(() =>
      createBaseEditor({ plugins: [pluginApiOwner, editorApiOwner] })
    ).toThrow(
      'Plate API namespace "sharedNamespace" is declared by both plugin API and editor API owners while resolving plugin "editorApiOwner".'
    );
  });

  it('merges plugin API across repeated stages', () => {
    const testPlugin = createBasePlugin({
      key: 'testPlugin',
      api: {
        method1: () => 1,
      },
    })
      .extend(() => ({
        api: {
          method2: () => 2,
        },
      }))
      .extend(({ api }) => ({
        api: {
          method3: () => api.method1() + api.method2(),
        },
      }));

    const editor = createBaseEditor({
      plugins: [testPlugin],
    });

    expect(editor.plugin(testPlugin).api.method1()).toBe(1);
    expect(editor.plugin(testPlugin).api.method2()).toBe(2);
    expect(editor.plugin(testPlugin).api.method3()).toBe(3);
    expect(editor.api.testPlugin.method3()).toBe(3);
  });

  it('reads plugin initialState while defining plugin API', () => {
    const testPlugin = createBasePlugin({
      key: 'testPlugin',
      initialState: {
        baseValue: 10,
      },
    }).extend(({ store }) => ({
      api: {
        getValue: () => store.get().baseValue,
      },
    }));

    const editor = createBaseEditor({
      plugins: [testPlugin],
    });

    expect(editor.plugin(testPlugin).api.getValue()).toBe(10);
    expect(editor.api.testPlugin.getValue()).toBe(10);
  });

  it('allow interaction between global and plugin-specific APIs', () => {
    const testPlugin = createBasePlugin({
      key: 'testPlugin',
      extension: {
        api: {
          globalMethod: () => 5,
        },
      },
    }).extend(({ editor }) => ({
      api: {
        pluginMethod: () => editor.api.globalMethod() * 2,
      },
    }));

    const editor = createBaseEditor({
      plugins: [testPlugin],
    });

    expect(editor.plugin(testPlugin).api.pluginMethod()).toBe(10);
  });

  it('maintain separate contexts for different plugins', () => {
    const plugin1 = createBasePlugin({
      key: 'plugin1',
      api: {
        method: () => 'plugin1',
      },
    });

    const plugin2 = createBasePlugin({
      key: 'plugin2',
      api: {
        method: () => 'plugin2',
      },
    });

    const editor = createBaseEditor({
      plugins: [plugin1, plugin2],
    });

    expect(editor.plugin(plugin1).api.method()).toBe('plugin1');
    expect(editor.plugin(plugin2).api.method()).toBe('plugin2');
    expect(editor.api.plugin1.method()).toBe('plugin1');
    expect(editor.api.plugin2.method()).toBe('plugin2');
  });

  it('allow overriding plugin-specific APIs', () => {
    const basePlugin = createBasePlugin({
      key: 'basePlugin',
      api: {
        method: () => 'base',
      },
    });

    const overridePlugin = createBasePlugin({
      key: 'overridePlugin',
    }).extend(({ editor }) => {
      const baseApi = getEditorPlugin(editor, basePlugin).api;

      return {
        api: {
          method: () => `override ${baseApi.method()}`,
        },
      };
    });

    const editor = createBaseEditor({
      plugins: [basePlugin, overridePlugin],
    });

    expect(editor.plugin(basePlugin).api.method()).toBe('base');
    expect(editor.plugin(overridePlugin).api.method()).toBe('override base');
    expect(editor.api.basePlugin.method()).toBe('base');
    expect(editor.api.overridePlugin.method()).toBe('override base');
  });

  it('keeps root and plugin API contributions distinct', () => {
    const testPlugin = createBasePlugin({
      key: 'testPlugin',
      initialState: {
        baseValue: 5,
      },
      extension: {
        api: {
          globalMethod: () => 'global',
        },
      },
    })
      .extend(({ store }) => ({
        api: {
          pluginMethod: () => store.get().baseValue,
        },
      }))
      .extend(({ api, editor }) => ({
        extension: {
          api: {
            combinedMethod: () =>
              `${editor.api.globalMethod()}-${api.pluginMethod()}`,
          },
        },
      }));

    const editor = createBaseEditor({
      plugins: [testPlugin],
    });

    expect(editor.api.globalMethod()).toBe('global');
    expect(editor.plugin(testPlugin).api.pluginMethod()).toBe(5);
    expect(editor.api.testPlugin.pluginMethod()).toBe(5);
    expect(editor.api.combinedMethod()).toBe('global-5');
  });
});
