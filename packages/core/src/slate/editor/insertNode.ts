import { Editor } from 'slate';
import { EDescendant } from '../node/TDescendant';
import { TEditor, Value } from './TEditor';

/**
 * Insert a node at the current selection.
 *
 * If the selection is currently expanded, it will be deleted first.
 */
export const insertNode = <V extends Value>(
  editor: TEditor<V>,
  node: EDescendant<V> | EDescendant<V>[]
) => Editor.insertNode(editor as any, node as any);
