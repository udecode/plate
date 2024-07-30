import { Editor } from 'slate';

import type { TElement } from '../element/TElement';
import type { TEditor } from './TEditor';

/** Check if an element is empty, accounting for void nodes. */
export const isElementEmpty = (editor: TEditor, element: TElement) =>
  Editor.isEmpty(editor as any, element);
