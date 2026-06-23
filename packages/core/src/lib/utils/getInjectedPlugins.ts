import type { BasePlateEditor } from '../editor';
import type { AnyEditorPlugin, EditorPlugins } from '../plugin/EditorPlugin';

/**
 * Get all plugins having a defined `inject.plugins[plugin.key]`. It includes
 * `plugin` itself.
 */
export const getInjectedPlugins = (
  editor: BasePlateEditor,
  plugin: AnyEditorPlugin
): Partial<AnyEditorPlugin>[] => {
  const injectedPlugins: EditorPlugins = [];

  [...editor.meta.pluginList].reverse().forEach((p) => {
    const injectedPlugin = p.inject.plugins?.[plugin.key];

    if (injectedPlugin) injectedPlugins.push(injectedPlugin as any);
  });

  return [plugin, ...injectedPlugins];
};
