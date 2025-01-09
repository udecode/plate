import { hasInlines as hasInlinesBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { TElement } from '../../interfaces/element';

export const hasInlines = (editor: Editor, element: TElement) =>
  hasInlinesBase(editor as any, element);
