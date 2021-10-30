import { PlatePluginOptions } from '../types/PlatePluginOptions/PlateOptions';
import { SPEditor } from '../types/SPEditor';
import { AnyObject } from '../types/utility/AnyObject';
import { getEditorOptions } from './getEditorOptions';

/**
 * Get SP options by plugin key.
 */
export const getPlatePluginOptions = <T = AnyObject>(
  editor?: SPEditor,
  pluginKey = ''
) =>
  ({
    type: pluginKey,
    ...(getEditorOptions(editor)[pluginKey] as any),
  } as PlatePluginOptions<T>);
