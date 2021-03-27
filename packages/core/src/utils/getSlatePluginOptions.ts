import { SPEditor } from '../types/SPEditor';
import { getEditorOptions } from './getEditorOptions';

/**
 * Get SP options by plugin key.
 */
export const getSlatePluginOptions = (editor: SPEditor, pluginKey: string) =>
  getEditorOptions(editor)[pluginKey] ?? {};
