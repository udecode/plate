import { type TText, NodeApi } from '@udecode/slate';
import { type NodeEntry, Path } from 'slate';

import type { SlateEditor } from '../../../editor';
import type { EdgeNodes } from '../types';

/**
 * When the cursor is at a mark edge, this function returns the current node and
 * the sibling node (if any). If the cursor is at the start of the text, then
 * the node before the text is returned. If the cursor is at the end of the
 * text, then the node after the text is returned. Otherwise, null is returned.
 */
export const getEdgeNodes = (editor: SlateEditor): EdgeNodes | null => {
  if (!editor.api.isCollapsed()) return null;

  const cursor = editor.selection!.anchor;

  const textRange = editor.api.range(cursor.path);

  if (!textRange) return null;

  const edge = editor.api.isStart(cursor, textRange)
    ? 'start'
    : editor.api.isEnd(cursor, textRange)
      ? 'end'
      : null;

  if (!edge) return null;

  const textEntry: NodeEntry<TText> = [
    NodeApi.get(editor, cursor.path)!,
    cursor.path,
  ];

  if (edge === 'start' && cursor.path.at(-1) === 0) {
    return [null, textEntry];
  }

  const siblingPath =
    edge === 'end' ? Path.next(cursor.path) : Path.previous(cursor.path);
  const siblingNode = NodeApi.get<TText>(editor, siblingPath);

  const siblingEntry: NodeEntry<TText> | null = siblingNode
    ? [siblingNode, siblingPath]
    : null;

  return edge === 'end' ? [textEntry, siblingEntry] : [siblingEntry, textEntry];
};
