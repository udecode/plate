import type { NodeComponent, PluginConfig } from '../../lib';

import { resolvePluginTest } from '../../internal/plugin/resolveCreatePluginTest';
import { createPlateEditor } from '../editor';
import { createPlatePlugin } from './createPlatePlugin';

describe('withComponent method', () => {
  it('set the component for the plugin', () => {
    const MockComponent: NodeComponent = () => null;
    const basePlugin = createPlatePlugin({ key: 'testPlugin' });

    const componentPlugin = basePlugin.withComponent(MockComponent);
    const resolvedPlugin = resolvePluginTest(componentPlugin);

    expect(resolvedPlugin.render.node).toBe(MockComponent);
  });

  it('override an existing component', () => {
    const OriginalComponent: NodeComponent = () => null;
    const NewComponent: NodeComponent = () => null;

    const basePlugin = createPlatePlugin({
      key: 'testPlugin',
      render: { node: OriginalComponent },
    });

    const componentPlugin = basePlugin.withComponent(NewComponent);
    const resolvedPlugin = resolvePluginTest(componentPlugin);

    expect(resolvedPlugin.render.node).not.toBe(OriginalComponent);
    expect(resolvedPlugin.render.node).toBe(NewComponent);
    expect(resolvedPlugin.node.component).not.toBe(OriginalComponent);
    expect(resolvedPlugin.node.component).toBe(NewComponent);
  });

  it('override an existing component with node.component', () => {
    const OriginalComponent: NodeComponent = () => null;
    const NewComponent: NodeComponent = () => null;

    const basePlugin = createPlatePlugin({
      key: 'testPlugin',
      node: { component: OriginalComponent },
    });

    const componentPlugin = basePlugin.withComponent(NewComponent);
    const resolvedPlugin = resolvePluginTest(componentPlugin);

    expect(resolvedPlugin.render.node).not.toBe(OriginalComponent);
    expect(resolvedPlugin.render.node).toBe(NewComponent);
    expect(resolvedPlugin.node.component).not.toBe(OriginalComponent);
    expect(resolvedPlugin.node.component).toBe(NewComponent);
  });

  it('extendEditorApi', () => {
    type CodeBlockConfig = PluginConfig<
      'code_block',
      { syntax: boolean; syntaxPopularFirst: boolean },
      {
        plugin: {
          getSyntaxState: () => boolean;
        };
        toggleSyntax: () => void;
      }
    >;

    createPlatePlugin({
      key: 'code_block',
      options: { syntax: true, syntaxPopularFirst: false },
    })
      .extendEditorApi<CodeBlockConfig['api']>(() => ({
        plugin: {
          getSyntaxState: () => true,
        },
        toggleSyntax: () => {},
      }))
      .extend(() => ({
        options: {
          hotkey: ['mod+opt+8', 'mod+shift+8'],
        },
      }));

    expect(1).toBe(1);
  });

  it('extendTx keeps the Plate plugin wrapper chain', () => {
    const plugin = createPlatePlugin({ key: 'txPlugin' }).extendTx(
      () => () => ({
        replace: () => undefined,
      })
    );

    expect(plugin.__txExtensions).toHaveLength(1);
    expect(plugin.extendTx(() => () => ({})).__txExtensions).toHaveLength(2);
  });

  it('extendExtension keeps the Plate plugin wrapper chain', () => {
    const RuntimePlugin = createPlatePlugin({ key: 'runtime' })
      .extendExtension({
        api: {
          runtime: {
            key: () => 'runtime' as const,
          },
        },
      })
      .extendExtension({
        api: {
          runtime: {
            label: () => 'Runtime' as const,
          },
        },
      });

    expect(RuntimePlugin.__editorExtensions).toHaveLength(2);

    const editor = createPlateEditor({ plugins: [RuntimePlugin] });

    expect(editor.api.runtime.key()).toBe('runtime');
    expect(editor.api.runtime.label()).toBe('Runtime');
  });

  it('infers Plate tx groups on createPlateEditor update callbacks', () => {
    const TxPlugin = createPlatePlugin({ key: 'txPlugin' }).extendTx(
      () => () => ({
        replace: (text: string) => text.length,
      })
    );

    const editor = createPlateEditor({
      plugins: [TxPlugin],
    });

    editor.update((tx) => {
      const length = tx.txPlugin.replace('text');

      return length satisfies number;
    });

    expect(1).toBe(1);
  });

  it('infers explicit Plate tx groups on createPlateEditor update callbacks', () => {
    const TxPlugin = createPlatePlugin({ key: 'sourcePlugin' }).extendTxGroup(
      'foreignTx',
      () => () => ({
        replace: (text: string) => text.length,
      })
    );

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

  it('exposes plugin context as a Plate editor method', () => {
    type MethodConfig = PluginConfig<
      'methodPlugin',
      { enabled: boolean },
      { method: { isEnabled: () => boolean } }
    >;

    const MethodPlugin = createPlatePlugin<MethodConfig>({
      key: 'methodPlugin',
      options: { enabled: true },
    }).extendEditorApi<MethodConfig['api']>(({ getOption }) => ({
      method: {
        isEnabled: () => getOption('enabled'),
      },
    }));

    const editor = createPlateEditor({ plugins: [MethodPlugin] });
    const pluginContext = editor.plugin(MethodPlugin);
    const keyedContext = editor.plugin<MethodConfig>('methodPlugin');

    expect(pluginContext.getOption('enabled') satisfies boolean).toBe(true);
    expect(pluginContext.api.method.isEnabled() satisfies boolean).toBe(true);
    expect(keyedContext.getOptions().enabled satisfies boolean).toBe(true);
  });
});
