import { editorCommands } from '@platejs/plite';

import type { NodeComponent, PluginConfig } from '../../lib';
import { resolvePluginTest } from '../../internal/plugin/resolveCreatePluginTest';
import { createPlateEditor } from '../editor';
import { createPlatePlugin } from './createPlatePlugin';

describe('createPlatePlugin', () => {
  it('normalizes component to render.node', () => {
    const Component: NodeComponent = () => null;
    const plugin = createPlatePlugin({
      component: Component,
      key: 'testPlugin',
    });
    const resolvedPlugin = resolvePluginTest(plugin);

    expect(resolvedPlugin.render.node).toBe(Component);
  });

  it('lets terminal configuration replace the component', () => {
    const OriginalComponent: NodeComponent = () => null;
    const NewComponent: NodeComponent = () => null;
    const plugin = createPlatePlugin({
      component: OriginalComponent,
      key: 'testPlugin',
    }).configure({ component: NewComponent });
    const resolvedPlugin = resolvePluginTest(plugin);

    expect(resolvedPlugin.render.node).toBe(NewComponent);
  });

  it('publishes root API through extension', () => {
    type CodeBlockConfig = PluginConfig<
      'codeBlock',
      { syntax: boolean; syntaxPopularFirst: boolean },
      {
        plugin: {
          getSyntaxState: () => boolean;
        };
        toggleSyntax: () => void;
      }
    >;

    createPlatePlugin<CodeBlockConfig>({
      key: 'codeBlock',
      type: 'code_block',
      options: { syntax: true, syntaxPopularFirst: false },
      extension: {
        api: {
          plugin: {
            getSyntaxState: () => true,
          },
          toggleSyntax: () => {},
        },
      },
    }).extend(() => ({
      options: {
        hotkey: ['mod+opt+8', 'mod+shift+8'],
      },
    }));

    expect(1).toBe(1);
  });

  it('keeps the Plate wrapper when publishing updates', () => {
    const plugin = createPlatePlugin({
      key: 'txPlugin',
      update: () => ({
        replace: () => 'replace' as const,
      }),
    }).extend(() => ({
      update: () => ({
        insert: () => 'insert' as const,
      }),
    }));
    const editor = createPlateEditor({ plugins: [plugin] });

    expect(editor.plugin(plugin).update.replace()).toBe('replace');
    expect(editor.plugin(plugin).update.insert()).toBe('insert');
  });

  it('keeps the Plate wrapper when publishing editor behavior', () => {
    const RuntimePlugin = createPlatePlugin({
      key: 'runtime',
      extension: {
        api: {
          runtime: {
            key: () => 'runtime' as const,
          },
        },
      },
    }).extend(() => ({
      extension: {
        api: {
          runtime: {
            label: () => 'Runtime' as const,
          },
        },
      },
    }));

    const editor = createPlateEditor({
      plugins: [RuntimePlugin],
    });

    expect(editor.api.runtime.key()).toBe('runtime');
    expect(editor.api.runtime.label()).toBe('Runtime');
  });

  it('infers Plate tx groups on createPlateEditor update callbacks', () => {
    const TxPlugin = createPlatePlugin({
      key: 'txPlugin',
      update: () => ({
        replace: (text: string) => text.length,
      }),
    });

    const editor = createPlateEditor({
      plugins: [TxPlugin],
    });

    editor.update((tx) => {
      const length = tx.txPlugin.replace('text');

      return length satisfies number;
    });

    expect(1).toBe(1);
  });

  it('infers Plate tx groups in editor extension commands', () => {
    createPlatePlugin({
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

  it('infers explicit Plate tx groups on createPlateEditor update callbacks', () => {
    const TxPlugin = createPlatePlugin({
      key: 'sourcePlugin',
      extension: {
        tx: {
          foreignTx: () => ({
            replace: (text: string) => text.length,
          }),
        },
      },
    });

    const editor = createPlateEditor({
      plugins: [TxPlugin],
    });

    editor.update((tx) => {
      type Transaction = typeof tx;
      type _MissingPluginGroup = Transaction extends {
        sourcePlugin: unknown;
      }
        ? never
        : true;
      const missingPluginGroup: _MissingPluginGroup = true;
      const length = tx.foreignTx.replace('text');

      void missingPluginGroup;
      return length satisfies number;
    });

    expect(1).toBe(1);
  });

  it('contextually types declared explicit Plate tx groups', () => {
    type DeclaredTxConfig = PluginConfig<
      'sourcePlugin',
      {},
      {},
      { foreignTx: { replace: (text: string) => number } }
    >;

    const plugin = createPlatePlugin<DeclaredTxConfig>({
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
    const editor = createPlateEditor({ plugins: [plugin] });

    expect(editor.update.foreignTx.replace('text')).toBe(4);
  });

  it('exposes plugin context as a Plate editor method', () => {
    type MethodConfig = PluginConfig<
      'methodPlugin',
      { enabled: boolean },
      { method: { isEnabled: () => boolean } }
    >;

    const MethodPlugin = createPlatePlugin<MethodConfig>({
      key: 'methodPlugin',
      options: { enabled: true },
    }).extend<{ extension: { api: MethodConfig['api'] } }>(({ getOption }) => ({
      extension: {
        api: {
          method: {
            isEnabled: () => getOption('enabled'),
          },
        },
      },
    }));

    const editor = createPlateEditor({
      plugins: [MethodPlugin],
    });
    const pluginContext = editor.plugin(MethodPlugin);

    expect(pluginContext.getOption('enabled') satisfies boolean).toBe(true);
    expect(editor.api.method.isEnabled() satisfies boolean).toBe(true);
    // @ts-expect-error root editor APIs do not leak into plugin portals
    expect(pluginContext.api.method).toBeUndefined();
  });
});
