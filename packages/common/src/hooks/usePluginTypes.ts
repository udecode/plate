import { getPluginType, SPEditor } from '@udecode/slate-plugins-core';
import { castArray } from 'lodash';

export const usePluginTypes = (pluginKey: string | string[]) => (
  editor: SPEditor
): string[] => {
  const pluginKeys = castArray<string>(pluginKey);

  return pluginKeys.map((key) => getPluginType(editor, key));
};
