import { hasBlocks as hasBlocksBase } from 'slate';

import type { TElement } from '../../interfaces/element/TElement';
import type { TEditor } from '../../interfaces/editor/TEditor';

export const hasBlocks = (editor: TEditor, element: TElement) =>
  hasBlocksBase(editor as any, element);
