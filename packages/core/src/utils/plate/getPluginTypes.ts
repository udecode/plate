import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { getPluginType } from './getPluginType';

/**
 * Get plugin types option by plugin keys.
 */
export const getPluginTypes = <V extends Value>(
  editor: PlateEditor<V>,
  keys: string[]
) => keys.map((key) => getPluginType(editor, key));
