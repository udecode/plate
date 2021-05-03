import { getSlatePluginType } from '../utils/getSlatePluginType';
import { useEditorRef } from './useEditorRef';

/**
 * @see {@link getSlatePluginType}
 */
export const useSlatePluginType = (pluginKey: string) => {
  return getSlatePluginType(useEditorRef(), pluginKey);
};
