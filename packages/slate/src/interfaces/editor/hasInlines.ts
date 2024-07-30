import { Editor } from 'slate';

import type { TElement } from '../element/TElement';
import type { TEditor } from './TEditor';

/** Check if a node has inline and text children. */
export const hasInlines = (editor: TEditor, element: TElement) =>
  Editor.hasInlines(editor as any, element);
