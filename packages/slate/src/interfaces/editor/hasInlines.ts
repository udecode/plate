import { Editor } from 'slate';

import type { TElement } from '../element/TElement';
import type { TEditor } from './TEditor';

export const hasInlines = (editor: TEditor, element: TElement) =>
  Editor.hasInlines(editor as any, element);
