import type { NodeComponent, PluginConfig } from '../../lib';

import { resolvePluginTest } from '../../internal/plugin/resolveCreatePluginTest';
import { createPlateEditor } from '../editor';
import { createPlatePlugin } from './createPlatePlugin';

describe('withComponent method', () => {
  it('set the component for the plugin', () => {
    const MockComponent: NodeComponent = () => null;
    const basePlugin = createPlatePlugin({ key: 'testPlugin' });

    const pluginWithComponent = basePlugin.withComponent(MockComponent);
    const resolvedPlugin = resolvePluginTest(pluginWithComponent);

    expect(resolvedPlugin.render.node).toBe(MockComponent);
  });

  it('override an existing component', () => {
    const OriginalComponent: NodeComponent = () => null;
    const NewComponent: NodeComponent = () => null;

    const basePlugin = createPlatePlugin({
      key: 'testPlugin',
      render: { node: OriginalComponent },
    });

    const pluginWithNewComponent = basePlugin.withComponent(NewComponent);
    const resolvedPlugin = resolvePluginTest(pluginWithNewComponent);

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

    const pluginWithNewComponent = basePlugin.withComponent(NewComponent);
    const resolvedPlugin = resolvePluginTest(pluginWithNewComponent);

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
        extendEditor: ({ api, editor }) => {
          // No type error
          api.plugin.getSyntaxState();
          api.toggleSyntax();

          return editor;
        },
      }));

    expect(1).toBe(1);
  });

  it('extendTx keeps the Plate plugin wrapper chain', () => {
    const plugin = createPlatePlugin({ key: 'txPlugin' }).extendTx(() => ({
      txPlugin: () => ({ replace: () => undefined }),
    }));

    expect(plugin.__txExtensions).toHaveLength(1);
    expect(plugin.extendTx(() => ({})).__txExtensions).toHaveLength(2);
  });

  it('infers Plate tx groups on createPlateEditor update callbacks', () => {
    const TxPlugin = createPlatePlugin({ key: 'txPlugin' }).extendTx(
      ({ plugin }) => ({
        [plugin.key]: () => ({
          replace: (text: string) => text.length,
        }),
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

  it('accepts legacy normalizeInitialValue handlers that mutate in place', () => {
    createPlatePlugin({
      key: 'normalize',
      normalizeInitialValue: ({ value }) => {
        value.push({
          children: [{ text: '' }],
          type: 'p',
        } as any);
      },
    });

    expect(1).toBe(1);
  });
});
