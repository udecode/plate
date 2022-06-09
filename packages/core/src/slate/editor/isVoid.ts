import { Editor } from 'slate';
import { TElement } from '../element/TElement';
import { TEditor, Value } from './TEditor';

/**
 * Check if a value is a void `Element` object.
 */
export const isVoid = <V extends Value>(
  editor: TEditor<V>,
  value: any
): value is TElement => {
  return Editor.isVoid(editor as any, value);
};
