import type { BaseEditor } from '../editor';
import type { AnyBasePlugin, BasePlugins } from '../plugin/BasePlugin';

/**
 * Get all plugins having a defined `inject.plugins[plugin.key]`. It includes
 * `plugin` itself.
 */
export const getInjectedPlugins = (
  editor: BaseEditor,
  plugin: AnyBasePlugin
): Partial<AnyBasePlugin>[] => {
  const injectedPlugins: BasePlugins = [];

  [...editor.meta.pluginList].reverse().forEach((p) => {
    const injectedPlugin = p.inject.plugins?.[plugin.key];

    if (injectedPlugin) injectedPlugins.push(injectedPlugin as any);
  });

  return [plugin, ...injectedPlugins];
};
