import { getPluginsOptions, SPEditor } from '@udecode/slate-plugins-core';
import { castArray } from 'lodash';
import { getRenderElement } from '../utils/getRenderElement';

export const useRenderElement = (pluginKey: string | string[]) => (
  editor: SPEditor
) => {
  const pluginKeys = castArray<string>(pluginKey);

  return getRenderElement(getPluginsOptions(editor, pluginKeys));
};
