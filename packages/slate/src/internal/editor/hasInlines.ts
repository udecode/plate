import { hasInlines as hasInlinesBase } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { TElement } from '../../interfaces/element/TElement';

export const hasInlines = (editor: TEditor, element: TElement) =>
  hasInlinesBase(editor as any, element);
