import { Value } from '../slate/editor/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin, WithPlatePlugin } from '../types/plugins/PlatePlugin';

export const setDefaultPlugin = <
  P = {},
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  plugin: PlatePlugin<P, V, E>
): WithPlatePlugin<P, V, E> => {
  if (plugin.type === undefined) plugin.type = plugin.key;
  if (!plugin.options) plugin.options = {} as any;
  if (!plugin.inject) plugin.inject = {};
  if (!plugin.editor) plugin.editor = {};

  return plugin as WithPlatePlugin<P, V, E>;
};
