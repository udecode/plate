import { SPEditor } from '../types/SPEditor';
import { getPlatePluginOptions } from './getPlatePluginOptions';

/**
 * Get SP type option by plugin key.
 */
export const getPlatePluginType = (
  editor?: SPEditor,
  pluginKey?: string
): string => getPlatePluginOptions(editor, pluginKey).type ?? pluginKey ?? '';
