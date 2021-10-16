import { PlateOptions } from '../types/PlatePluginOptions/PlateOptions';
import { SPEditor } from '../types/SPEditor';
import { AnyObject } from '../types/utility/AnyObject';

/**
 * Get editor.options.
 */
export const getEditorOptions = <T = AnyObject>(editor?: SPEditor) =>
  (editor?.options as PlateOptions<T>) ?? ({} as PlateOptions<T>);
