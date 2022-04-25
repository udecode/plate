import { Editor } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { TElement } from '../../../types/slate/TElement';

/**
 * Check if a value is an inline `Element` object.
 */
export const isInline = <V extends Value>(
  editor: TEditor<V>,
  value: any
): value is TElement => Editor.isInline(editor as any, value);
