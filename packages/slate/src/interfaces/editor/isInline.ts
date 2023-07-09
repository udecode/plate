import { Editor } from 'slate';

import { isElement } from '../element';
import { TEditor, Value } from './TEditor';

/**
 * Check if a value is an inline `Element` object.
 */
export const isInline = <V extends Value>(
  editor: TEditor<V>,
  value: any
): boolean => isElement(value) && Editor.isInline(editor as any, value);
