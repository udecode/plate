import { hasBlocks as hasBlocksBase } from 'slate';

import type { TElement } from '../element/TElement';
import type { TEditor } from './TEditor';

export const hasBlocks = (editor: TEditor, element: TElement) =>
  hasBlocksBase(editor as any, element);
