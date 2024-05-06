import { Editor } from 'slate';

import type { TEditor, Value } from './TEditor';

import { isElement } from '../element';

/** Check if a value is an inline `Element` object. */
export const isInline = <V extends Value>(
  editor: TEditor<V>,
  value: any
): boolean => isElement(value) && Editor.isInline(editor as any, value);
