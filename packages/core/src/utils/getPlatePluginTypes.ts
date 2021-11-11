import { castArray } from 'lodash';
import { PlateEditor } from '../types/PlateEditor';
import { getPlatePluginType } from './getPlatePluginType';

export const getPlatePluginTypes = (key: string | string[]) => (
  editor: PlateEditor
): string[] => {
  const pluginKeys = castArray<string>(key);

  return pluginKeys.map((_key) => getPlatePluginType(editor, _key));
};
