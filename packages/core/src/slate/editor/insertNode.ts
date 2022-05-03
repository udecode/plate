import { Editor } from 'slate';
import { TEditor, Value } from '../types/TEditor';
import { EElement } from '../types/TElement';
import { EText } from '../types/TText';

/**
 * Insert a node at the current selection.
 *
 * If the selection is currently expanded, it will be deleted first.
 */
export const insertNode = <V extends Value>(
  editor: TEditor<V>,
  node: EElement<V> | EText<V> | Array<EElement<V> | EText<V>>
) => Editor.insertNode(editor as any, node as any);
