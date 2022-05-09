import { Value } from '../slate/editor/TEditor';
import { PlatePlugin, WithPlatePlugin } from '../types/plugins/PlatePlugin';

export const setDefaultPlugin = <V extends Value, T = {}, P = {}>(
  plugin: PlatePlugin<V, T, P>
): WithPlatePlugin<V, T, P> => {
  if (plugin.type === undefined) plugin.type = plugin.key;
  if (!plugin.options) plugin.options = {} as any;
  if (!plugin.inject) plugin.inject = {};
  if (!plugin.editor) plugin.editor = {};

  return plugin as WithPlatePlugin<V, T, P>;
};
