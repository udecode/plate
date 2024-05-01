import type { Value } from '@udecode/slate';

import type { PlateEditor } from '../types/PlateEditor';

import { getPluginType } from './getPluginType';

/** Get plugin types option by plugin keys. */
export const getPluginTypes = <V extends Value>(
  editor: PlateEditor<V>,
  keys: string[]
) => keys.map((key) => getPluginType(editor, key));
