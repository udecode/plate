import { Editor } from 'slate';

import type { TElement } from '../element/TElement';
import type { TEditor } from './TEditor';

/** Check if a node has block children. */
export const hasBlocks = (editor: TEditor, element: TElement) =>
  Editor.hasBlocks(editor as any, element);
