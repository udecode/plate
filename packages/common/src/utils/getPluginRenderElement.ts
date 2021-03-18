import { getPluginsOptions } from '@udecode/slate-plugins-core';
import { castArray } from 'lodash';
import { Editor } from 'slate';
import { getRenderElement } from './getRenderElement';

export const getPluginRenderElement = (pluginKey: string | string[]) => (
  editor: Editor
) => {
  const pluginKeys = castArray<string>(pluginKey);

  return getRenderElement(getPluginsOptions(editor, pluginKeys));
};
