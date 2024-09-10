import type { SlateEditor } from '../editor';
import type { AnyEditorPlugin, SlatePlugins } from '../plugin/SlatePlugin';

/**
 * Get all plugins having a defined `inject.plugins[plugin.key]`. It includes
 * `plugin` itself.
 */
export const getInjectedPlugins = (
  editor: SlateEditor,
  plugin: AnyEditorPlugin
): Partial<AnyEditorPlugin>[] => {
  const injectedPlugins: SlatePlugins = [];

  [...editor.pluginList].reverse().forEach((p) => {
    const injectedPlugin = p.inject.plugins?.[plugin.key];

    if (injectedPlugin) injectedPlugins.push(injectedPlugin as any);
  });

  return [plugin, ...injectedPlugins];
};
