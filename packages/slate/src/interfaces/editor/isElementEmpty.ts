import { Editor } from 'slate';

import type { TElement } from '../element/TElement';
import type { TEditor } from './TEditor';

export const isElementEmpty = (editor: TEditor, element: TElement) =>
  Editor.isEmpty(editor as any, element);
