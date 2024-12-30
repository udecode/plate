import { Editor } from 'slate';

import type { TElement } from '../element/TElement';
import type { TEditor } from './TEditor';

export const hasBlocks = (editor: TEditor, element: TElement) =>
  Editor.hasBlocks(editor as any, element);
