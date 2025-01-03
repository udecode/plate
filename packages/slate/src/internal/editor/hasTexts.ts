import { hasTexts as hasTextsBase } from 'slate';

import type { TElement } from '../../interfaces/element/TElement';
import type { TEditor } from '../../interfaces/editor/TEditor';

export const hasTexts = (editor: TEditor, element: TElement) =>
  hasTextsBase(editor as any, element);
