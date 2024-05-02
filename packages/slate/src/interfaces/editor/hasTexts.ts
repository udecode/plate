import { Editor } from 'slate';

import type { TElement } from '../element/TElement';
import type { TEditor, Value } from './TEditor';

/** Check if a node has text children. */
export const hasTexts = <V extends Value>(
  editor: TEditor<V>,
  element: TElement
) => Editor.hasTexts(editor as any, element);
