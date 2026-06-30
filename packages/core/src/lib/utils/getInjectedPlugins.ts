import type { BaseEditor } from '../editor';
import type { AnyBasePlugin } from '../plugin/BasePlugin';

/**
 * Get all plugins having a defined `inject.plugins[plugin.key]`. It includes
 * `plugin` itself.
 */
export const getInjectedPlugins = (
  editor: BaseEditor,
  plugin: AnyBasePlugin
): AnyBasePlugin[] => {
  const injectedPlugins: AnyBasePlugin[] = [];

  [...editor.runtime.pluginList].reverse().forEach((p) => {
    const injectedPlugin = p.inject.plugins?.[plugin.key];

    if (injectedPlugin) {
      injectedPlugins.push({
        ...plugin,
        ...injectedPlugin,
        key: injectedPlugin.key ?? plugin.key,
      } as AnyBasePlugin);
    }
  });

  return [plugin, ...injectedPlugins];
};
