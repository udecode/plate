import { PlatePluginInjectedPlugin } from '../types/plugins/PlatePluginInjectedPlugin';

/**
 * Is the plugin disabled by another plugin.
 */
export const isPluginDisabled = (
  injectedPlugins: PlatePluginInjectedPlugin[]
) => injectedPlugins.some((injectedPlugin) => injectedPlugin.isDisabled);
