import { hasTexts as hasTextsBase } from 'slate';

import type { TElement } from '../element/TElement';
import type { TEditor } from './TEditor';

export const hasTexts = (editor: TEditor, element: TElement) =>
  hasTextsBase(editor as any, element);
