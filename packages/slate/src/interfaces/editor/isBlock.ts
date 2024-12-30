import { isBlock as isBlockBase } from 'slate';

import type { TEditor } from './TEditor';

import { isElement } from '../element';

export const isBlock = (editor: TEditor, value: any): boolean =>
  isElement(value) && isBlockBase(editor as any, value);
