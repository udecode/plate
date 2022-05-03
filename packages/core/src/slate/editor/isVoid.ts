import { Editor } from 'slate';
import { TEditor, Value } from '../types/TEditor';
import { TElement } from '../types/TElement';

/**
 * Check if a value is a void `Element` object.
 */
export const isVoid = <V extends Value>(
  editor: TEditor<V>,
  value: any
): value is TElement => {
  return Editor.isVoid(editor as any, value);
};
