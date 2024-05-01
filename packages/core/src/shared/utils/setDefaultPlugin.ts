import { Value } from '@udecode/slate';

import { PlateEditor } from '../types/PlateEditor';
import {
  PlatePlugin,
  PluginOptions,
  WithPlatePlugin,
} from '../types/plugin/PlatePlugin';

export const setDefaultPlugin = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  plugin: PlatePlugin<P, V, E>
): WithPlatePlugin<P, V, E> => {
  if (plugin.type === undefined) plugin.type = plugin.key;
  if (!plugin.options) plugin.options = {} as any;
  if (!plugin.inject) plugin.inject = {};
  if (!plugin.editor) plugin.editor = {};

  return plugin as WithPlatePlugin<P, V, E>;
};
