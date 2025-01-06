import { hasTexts as hasTextsBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';
import type { TElement } from '../../interfaces/element/TElement';

export const hasTexts = (editor: Editor, element: TElement) =>
  hasTextsBase(editor as any, element);
