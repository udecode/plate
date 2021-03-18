import { getPluginOptions, OnKeyDown } from '@udecode/slate-plugins-core';
import { getOnKeyDownMark } from './getOnKeyDownMark';

export const getPluginOnKeyDownMark = (pluginKey: string): OnKeyDown => (
  editor
) => getOnKeyDownMark(getPluginOptions(editor, pluginKey))?.(editor);
