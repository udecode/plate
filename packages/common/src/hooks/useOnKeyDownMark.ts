import { useEditorOptions } from '@udecode/slate-plugins-core';
import { getOnKeyDownMark } from '../utils/getOnKeyDownMark';

export const useOnKeyDownMark = (pluginKey: string) =>
  getOnKeyDownMark(useEditorOptions(pluginKey));
