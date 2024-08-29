import { Editor } from 'slate';

import type { ElementOrTextOf } from '../element/TElement';
import type { TEditor } from './TEditor';

/**
 * Insert a node at the current selection.
 *
 * If the selection is currently expanded, it will be deleted first.
 */
export const insertNode = <E extends TEditor>(
  editor: E,
  node: ElementOrTextOf<E> | ElementOrTextOf<E>[]
) => Editor.insertNode(editor as any, node as any);
