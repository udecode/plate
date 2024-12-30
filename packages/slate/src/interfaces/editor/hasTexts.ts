import { Editor } from 'slate';

import type { TElement } from '../element/TElement';
import type { TEditor } from './TEditor';

export const hasTexts = (editor: TEditor, element: TElement) =>
  Editor.hasTexts(editor as any, element);
