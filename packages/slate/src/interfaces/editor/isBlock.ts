import { isBlock as isBlockBase } from 'slate';

import type { TEditor } from './TEditor';

import { type TElement, isElement } from '../element';

export const isBlock = (editor: TEditor, value: any): value is TElement =>
  isElement(value) && isBlockBase(editor as any, value);
