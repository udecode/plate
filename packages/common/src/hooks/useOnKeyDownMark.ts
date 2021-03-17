import { useEditorPluginOptions } from '@udecode/slate-plugins-core';
import { getOnKeyDownMark } from '../utils/getOnKeyDownMark';

export const useOnKeyDownMark = (pluginKey: string) =>
  getOnKeyDownMark(useEditorPluginOptions(pluginKey));
