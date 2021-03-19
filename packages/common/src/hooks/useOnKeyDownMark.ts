import { getPluginOptions, OnKeyDown } from '@udecode/slate-plugins-core';
import { getOnKeyDownMark } from '../utils/getOnKeyDownMark';

export const useOnKeyDownMark = (pluginKey: string): OnKeyDown => (editor) =>
  getOnKeyDownMark(getPluginOptions(editor, pluginKey))?.(editor);
