import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { AnyObject } from '../types/utility/AnyObject';
import { getPluginsByKey } from './getPluginsByKey';

/**
 * Get plugin options by plugin key.
 */
export const getPlugin = <TPlugin = AnyObject, TEditor = {}>(
  editor?: PlateEditor<TEditor>,
  key = ''
) =>
  ({
    type: key,
    ...(getPluginsByKey(editor)[key] as any),
  } as PlatePlugin<TEditor, TPlugin>);
