import { Editor } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { ElementOf } from '../../../types/slate/TElement';
import { TextOf } from '../../../types/slate/TText';

/**
 * Insert a node at the current selection.
 *
 * If the selection is currently expanded, it will be deleted first.
 */
export const insertNode = <V extends Value>(
  editor: TEditor<V>,
  node:
    | ElementOf<TEditor<V>>
    | TextOf<TEditor<V>>
    | Array<ElementOf<TEditor<V>> | TextOf<TEditor<V>>>
) => Editor.insertNode(editor as any, node as any);
