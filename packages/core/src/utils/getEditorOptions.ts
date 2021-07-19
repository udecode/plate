import { PlateOptions } from '../types/PlatePluginOptions/PlateOptions';
import { SPEditor } from '../types/SPEditor';

/**
 * Get editor.options.
 */
export const getEditorOptions = (editor?: SPEditor): PlateOptions =>
  editor?.options ?? {};
