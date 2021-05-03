import { getSlatePluginOptions } from '../utils/getSlatePluginOptions';
import { useEditorRef } from './useEditorRef';

/**
 * @see {@link getSlatePluginOptions}
 */
export const useSlatePluginOptions = (pluginKey: string) => {
  return getSlatePluginOptions(useEditorRef(), pluginKey);
};
