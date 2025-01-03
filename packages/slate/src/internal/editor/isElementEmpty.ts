import { isEmpty } from 'slate';

import type { TEditor } from '../../interfaces/editor/TEditor';
import type { TElement } from '../../interfaces/element/TElement';

export const isElementEmpty = (editor: TEditor, element: TElement) =>
  isEmpty(editor as any, element);
