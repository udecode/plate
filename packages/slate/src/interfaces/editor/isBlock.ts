import { Editor } from 'slate';

import type { TEditor } from './TEditor';

import { isElement } from '../element';

export const isBlock = (editor: TEditor, value: any): boolean =>
  isElement(value) && Editor.isBlock(editor as any, value);
