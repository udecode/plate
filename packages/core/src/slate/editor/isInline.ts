import { Editor } from 'slate';
import { TEditor, Value } from './TEditor';
import { TElement } from '../element/TElement';

/**
 * Check if a value is an inline `Element` object.
 */
export const isInline = <V extends Value>(
  editor: TEditor<V>,
  value: any
): value is TElement => Editor.isInline(editor as any, value);
