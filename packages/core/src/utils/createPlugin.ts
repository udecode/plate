import defaultsDeep from 'lodash/defaultsDeep';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { NoInfer } from '../types/utility/NoInfer';

export const createPlugin = <TPlugin = {}>(
  plugin: PlatePlugin<{}, NoInfer<TPlugin>>
) => {
  return <TEditor = {}>(
    overrides?: Partial<PlatePlugin<TEditor, TPlugin>>
  ): PlatePlugin<TEditor, TPlugin> => {
    return defaultsDeep(overrides, plugin);
  };
};
