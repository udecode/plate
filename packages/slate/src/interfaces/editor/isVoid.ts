import { Editor } from 'slate';

import type { TEditor } from './TEditor';

import { isElement } from '../element';

export const isVoid = (editor: TEditor, value: any): boolean => {
  return isElement(value) && Editor.isVoid(editor as any, value);
};
