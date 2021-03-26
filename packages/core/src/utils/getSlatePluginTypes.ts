import { castArray } from 'lodash';
import { SPEditor } from '../types/SPEditor';
import { getSlatePluginType } from './getSlatePluginType';

export const getSlatePluginTypes = (pluginKey: string | string[]) => (
  editor: SPEditor
): string[] => {
  const pluginKeys = castArray<string>(pluginKey);

  return pluginKeys.map((key) => getSlatePluginType(editor, key));
};
