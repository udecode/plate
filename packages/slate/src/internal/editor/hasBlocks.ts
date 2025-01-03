import { hasBlocks as hasBlocksBase } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { TElement } from '../../interfaces/element/TElement';

export const hasBlocks = (editor: TEditor, element: TElement) =>
  hasBlocksBase(editor as any, element);
