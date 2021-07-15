import { ReactEditor, withReact } from 'slate-react';
import { TEditor } from '../types/TEditor';
import { getSlatePluginWithOverrides } from '../utils/getSlatePluginWithOverrides';

/**
 * @see {@link withReact}
 */
export const createReactPlugin = getSlatePluginWithOverrides(
  () => withReact as <T extends TEditor>(editor: T) => T & ReactEditor
);
