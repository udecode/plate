import { ReactEditor, withReact } from 'slate-react';
import { TEditor } from '../types/TEditor';
import { getPlatePluginWithOverrides } from '../utils/getPlatePluginWithOverrides';

/**
 * @see {@link withReact}
 */
export const createReactPlugin = getPlatePluginWithOverrides(
  () => withReact as <T extends TEditor>(editor: T) => T & ReactEditor
);
