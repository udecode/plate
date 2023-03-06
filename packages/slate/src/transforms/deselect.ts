import { Transforms } from 'slate';
import { TEditor, Value } from '../interfaces/editor/TEditor';

/**
 * Unset the selection.
 */
export const deselect = <V extends Value>(editor: TEditor<V>) => {
  Transforms.deselect(editor as any);
};
