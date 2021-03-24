import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
import { castArray } from 'lodash';

export const useSlatePluginTypes = (pluginKey: string | string[]) => (
  editor: SPEditor
): string[] => {
  const pluginKeys = castArray<string>(pluginKey);

  return pluginKeys.map((key) => getSlatePluginType(editor, key));
};
