import type { PlateEditor } from '../types/PlateEditor';
import type {
  AnyEditorPlugin,
  PlatePlugins,
} from '../types/plugin/PlatePlugin';

/**
 * Get all plugins having a defined `inject.pluginsByKey[plugin.key]`. It
 * includes `plugin` itself.
 */
export const getInjectedPlugins = (
  editor: PlateEditor,
  plugin: AnyEditorPlugin
): Partial<AnyEditorPlugin>[] => {
  const injectedPlugins: PlatePlugins = [];

  [...editor.plugins].reverse().forEach((p) => {
    const injectedPlugin = p.inject.pluginsByKey?.[plugin.key];

    if (injectedPlugin) injectedPlugins.push(injectedPlugin as any);
  });

  return [plugin, ...injectedPlugins];
};
