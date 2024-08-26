import { Editor } from 'slate';

import type { TEditor, Value } from './TEditor';

import { type TElement, isElement } from '../element';

/** Check if a value is a block `Element` object. */
export const isBlock = <V extends Value>(
  editor: TEditor<V>,
  value: any
): value is TElement =>
  isElement(value) && Editor.isBlock(editor as any, value);
