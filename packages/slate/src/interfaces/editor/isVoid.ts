import { Editor } from 'slate';

import type { TEditor, Value } from './TEditor';

import { isElement } from '../element';

/** Check if a value is a void `Element` object. */
export const isVoid = <V extends Value>(
  editor: TEditor<V>,
  value: any
): boolean => {
  return isElement(value) && Editor.isVoid(editor as any, value);
};
