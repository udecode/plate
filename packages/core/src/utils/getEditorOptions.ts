import { SlatePluginsOptions } from '../types/SlatePluginOptions/SlatePluginsOptions';
import { SPEditor } from '../types/SPEditor';

/**
 * Get editor.options.
 */
export const getEditorOptions = (editor?: SPEditor): SlatePluginsOptions =>
  editor?.options ?? {};
