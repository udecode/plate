import {
  type NodeComponent,
  type PluginConfig,
  resolvePluginTest,
} from '../../lib';
import { createPlatePlugin } from './createPlatePlugin';

describe('withComponent method', () => {
  it('should set the component for the plugin', () => {
    const MockComponent: NodeComponent = () => null;
    const basePlugin = createPlatePlugin({ key: 'testPlugin' });

    const pluginWithComponent = basePlugin.withComponent(MockComponent);
    const resolvedPlugin = resolvePluginTest(pluginWithComponent);

    expect(resolvedPlugin.render.node).toBe(MockComponent);
  });

  it('should override an existing component', () => {
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

  it('should override an existing component with node.component', () => {
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
        extendEditor: ({ api, editor }) => {
          // No type error
          api.plugin.getSyntaxState();
          api.toggleSyntax();

          return editor;
        },
        options: {
          hotkey: ['mod+opt+8', 'mod+shift+8'],
        },
      }));

    expect(1).toBe(1);
  });
});
