import defaultsDeep from 'lodash/defaultsDeep';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { PluginKey } from '../types/plugins/PlatePluginKey';
import { NoInfer } from '../types/utility/NoInfer';
import { mergePluginsByKey } from './mergePluginsByKey';

/**
 * Create plugin factory with a default plugin.
 * The plugin factory:
 * - first param can be used to (deeply) override the default plugin.
 * - second param can be used to (deeply) override a nested plugin (plugin.plugins) by key.
 */
export const createPluginFactory = <TPlugin = {}>(
  plugin: PlatePlugin<{}, NoInfer<TPlugin>>
) => <TEditor = {}>(
  overrides?: Partial<PlatePlugin<TEditor, NoInfer<TPlugin>>>,
  byKey?: Record<PluginKey, Partial<PlatePlugin<TEditor>>>
): PlatePlugin<TEditor, NoInfer<TPlugin>> => {
  let mergedPlugin: PlatePlugin<TEditor, TPlugin> = defaultsDeep(
    overrides,
    plugin
  );

  if (byKey) {
    mergedPlugin = defaultsDeep(
      mergePluginsByKey(mergedPlugin, byKey),
      mergedPlugin
    );

    const { then } = mergedPlugin;

    if (then) {
      mergedPlugin.then = (editor, p) => {
        const pluginThen = then(editor, p);

        return defaultsDeep(
          mergePluginsByKey(pluginThen as any, byKey),
          pluginThen
        );
      };
    }
  }

  return mergedPlugin;
};
