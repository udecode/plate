import { isBlock as isBlockBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';

import { type TElement, ElementApi } from '../../interfaces/element';

export const isBlock = (editor: Editor, value: any): value is TElement =>
  ElementApi.isElement(value) && isBlockBase(editor as any, value);
