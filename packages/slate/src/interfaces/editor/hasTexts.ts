import { Editor } from 'slate';

import type { TElement } from '../element/TElement';
import type { TEditor } from './TEditor';

/** Check if a node has text children. */
export const hasTexts = (editor: TEditor, element: TElement) =>
  Editor.hasTexts(editor as any, element);
