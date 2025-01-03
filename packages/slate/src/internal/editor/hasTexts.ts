import { hasTexts as hasTextsBase } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { TElement } from '../../interfaces/element/TElement';

export const hasTexts = (editor: TEditor, element: TElement) =>
  hasTextsBase(editor as any, element);
