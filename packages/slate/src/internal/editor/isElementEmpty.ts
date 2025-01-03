import { isEmpty } from 'slate';

import type { TElement } from '../../interfaces/element/TElement';
import type { TEditor } from '../../interfaces/editor/TEditor';

export const isElementEmpty = (editor: TEditor, element: TElement) =>
  isEmpty(editor as any, element);
