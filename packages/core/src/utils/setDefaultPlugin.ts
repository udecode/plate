import {
  PlatePlugin,
  WithPlatePlugin,
} from '../types/plugins/PlatePlugin/PlatePlugin';

export const setDefaultPlugin = <T = {}, P = {}>(
  plugin: PlatePlugin<T, P>
): WithPlatePlugin<T, P> => {
  if (plugin.type === undefined) plugin.type = plugin.key;
  if (!plugin.options) plugin.options = {} as any;
  if (!plugin.inject) plugin.inject = {};

  return plugin as WithPlatePlugin<T, P>;
};
