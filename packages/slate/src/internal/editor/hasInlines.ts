import { hasInlines as hasInlinesBase } from 'slate';

import type { TElement } from '../../interfaces/element/TElement';
import type { TEditor } from '../../interfaces/editor/TEditor';

export const hasInlines = (editor: TEditor, element: TElement) =>
  hasInlinesBase(editor as any, element);
