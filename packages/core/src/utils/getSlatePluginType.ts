import { SPEditor } from '../types/SPEditor';
import { getSlatePluginOptions } from './getSlatePluginOptions';

/**
 * Get SP type option by plugin key.
 */
export const getSlatePluginType = (
  editor: SPEditor,
  pluginKey: string
): string => getSlatePluginOptions(editor, pluginKey).type ?? pluginKey;
