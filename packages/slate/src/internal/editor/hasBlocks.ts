import { hasBlocks as hasBlocksBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';
import type { TElement } from '../../interfaces/element';

export const hasBlocks = (editor: Editor, element: TElement) =>
  hasBlocksBase(editor as any, element);
