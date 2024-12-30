import type { Path } from 'slate';

import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../editor';
import type { TNode } from '../node';

export const findPath = (editor: TEditor, node: TNode): Path | undefined => {
  try {
    return DOMEditor.findPath(editor as any, node);
  } catch (error) {}
};
