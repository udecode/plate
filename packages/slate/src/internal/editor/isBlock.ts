import { isBlock as isBlockBase } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';

import { type TElement, isElement } from '../../interfaces/element';

export const isBlock = (editor: TEditor, value: any): value is TElement =>
  isElement(value) && isBlockBase(editor as any, value);
