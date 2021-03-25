import { SPEditor } from '../types/SPEditor';
import { getSlatePluginOptions } from './getSlatePluginOptions';

/**
 * Map plugins keys to SP options
 */
export const mapSlatePluginKeysToOptions = (
  editor: SPEditor,
  pluginKeys: string[]
) => pluginKeys.map((pluginKey) => getSlatePluginOptions(editor, pluginKey));
