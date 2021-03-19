import { getPluginType } from '@udecode/slate-plugins-core';
import { castArray } from 'lodash';
import { Editor } from 'slate';

export const usePluginTypes = (pluginKey: string | string[]) => (
  editor: Editor
): string[] => {
  const pluginKeys = castArray<string>(pluginKey);

  return pluginKeys.map((key) => getPluginType(editor, key));
};
