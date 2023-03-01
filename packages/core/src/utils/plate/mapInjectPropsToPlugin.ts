import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { PlateEditor } from '../../types/plate/PlateEditor';
import {
  PlatePlugin,
  PluginOptions,
  WithPlatePlugin,
} from '../../types/plugin/PlatePlugin';
import { PluginKey } from '../../types/plugin/PlatePluginKey';
import { getKeysByTypes } from './getKeysByTypes';

/**
 * Map plugin inject props to injected plugin
 */
export const mapInjectPropsToPlugin = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  plugin: WithPlatePlugin<P, V, E>,
  injectedPlugin: Partial<PlatePlugin>
) => {
  const validTypes = plugin.inject.props?.validTypes;
  if (!validTypes) return;

  const keys = getKeysByTypes(editor, validTypes);

  const injected: Record<PluginKey, Partial<PlatePlugin>> = {};

  keys.forEach((key) => {
    injected[key] = injectedPlugin;
  });

  return {
    inject: {
      pluginsByKey: injected,
    },
  };
};
