import { Editor } from 'slate';

import type { TEditor } from './TEditor';

import { isElement } from '../element';

/** Check if a value is an inline `Element` object. */
export const isInline = (editor: TEditor, value: any): boolean =>
  isElement(value) && Editor.isInline(editor as any, value);
