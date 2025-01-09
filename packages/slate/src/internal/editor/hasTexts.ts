import { hasTexts as hasTextsBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { TElement } from '../../interfaces/element';

export const hasTexts = (editor: Editor, element: TElement) =>
  hasTextsBase(editor as any, element);
