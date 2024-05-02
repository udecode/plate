import { Editor } from 'slate';

import type { EElement } from '../element/TElement';
import type { TEditor, Value } from './TEditor';

/** Check if an element is empty, accounting for void nodes. */
export const isElementEmpty = <V extends Value>(
  editor: TEditor<V>,
  element: EElement<V>
) => Editor.isEmpty(editor as any, element);
