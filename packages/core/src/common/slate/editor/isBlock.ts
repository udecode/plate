import { Editor } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { TElement } from '../../../types/slate/TElement';

/**
 * Check if a value is a block `Element` object.
 */
export const isBlock = <V extends Value>(
  editor: TEditor<V>,
  value: any
): value is TElement => Editor.isBlock(editor as any, value);
