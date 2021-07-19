import { SPEditor } from '../types/SPEditor';
import { getEditorOptions } from './getEditorOptions';

/**
 * Get SP options by plugin key.
 */
export const getPlatePluginOptions = (editor?: SPEditor, pluginKey = '') =>
  getEditorOptions(editor)[pluginKey] ?? {};
