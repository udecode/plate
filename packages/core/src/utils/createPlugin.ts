import defaultsDeep from 'lodash/defaultsDeep';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';

export const createPlugin = <TPlugin = {}>(
  plugin: PlatePlugin<{}, TPlugin>
) => {
  return <TEditor = {}>(
    overrides?: Partial<PlatePlugin<TEditor, TPlugin>>
  ): PlatePlugin<TEditor, TPlugin> => {
    return defaultsDeep(overrides, plugin);
  };
};
