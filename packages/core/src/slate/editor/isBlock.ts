import { Editor } from 'slate';
import { TEditor, Value } from './TEditor';
import { TElement } from '../element/TElement';

/**
 * Check if a value is a block `Element` object.
 */
export const isBlock = <V extends Value>(
  editor: TEditor<V>,
  value: any
): value is TElement => Editor.isBlock(editor as any, value);
