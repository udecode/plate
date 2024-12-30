import { hasInlines as hasInlinesBase } from 'slate';

import type { TElement } from '../element/TElement';
import type { TEditor } from './TEditor';

export const hasInlines = (editor: TEditor, element: TElement) =>
  hasInlinesBase(editor as any, element);
