import { Transforms } from 'slate';
import { TEditor, Value } from '../types/TEditor';

/**
 * Unset the selection.
 */
export const deselect = <V extends Value>(editor: TEditor<V>) => {
  Transforms.deselect(editor as any);
};
