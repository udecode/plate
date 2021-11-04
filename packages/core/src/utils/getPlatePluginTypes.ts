import { castArray } from 'lodash';
import { PlateEditor } from '../types/PlateEditor';
import { getPlatePluginType } from './getPlatePluginType';

export const getPlatePluginTypes = (pluginKey: string | string[]) => (
  editor: PlateEditor
): string[] => {
  const pluginKeys = castArray<string>(pluginKey);

  return pluginKeys.map((key) => getPlatePluginType(editor, key));
};
