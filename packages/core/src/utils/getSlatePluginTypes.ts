import { castArray } from 'lodash';
import { SPEditor } from '../types/SPEditor';
import { getPlatePluginType } from './getPlatePluginType';

export const getPlatePluginTypes = (pluginKey: string | string[]) => (
  editor: SPEditor
): string[] => {
  const pluginKeys = castArray<string>(pluginKey);

  return pluginKeys.map((key) => getPlatePluginType(editor, key));
};
