import { PlateEditor } from '../types/PlateEditor';
import { PlatePluginOptions } from '../types/PlatePluginOptions/PlateOptions';
import { AnyObject } from '../types/utility/AnyObject';
import { getEditorOptions } from './getEditorOptions';

/**
 * Get plugin options by plugin key.
 */
export const getPlatePluginOptions = <T = AnyObject, E = {}>(
  editor?: PlateEditor<E>,
  key = ''
) =>
  ({
    type: key,
    ...(getEditorOptions(editor)[key] as any),
  } as PlatePluginOptions<T>);
