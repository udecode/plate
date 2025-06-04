import {
  type TElement,
  type TText,
  ElementApi,
  NodeApi,
  PathApi,
} from '@udecode/slate';
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

  const parent: TElement | null = (NodeApi.parent(editor, cursor.path) ??
    null) as TElement | null;

  /** Link */

  const isAffinityInlineElement = (() => {
    if (!parent) return false;

    const parentIsHardEdge = editor.meta.pluginKeys.node.isHardEdge.some(
      (key) => editor.getType(key) === parent.type
    );

    const parentIsAffinity = editor.meta.pluginKeys.node.isAffinity.some(
      (key) => editor.getType(key) === parent.type
    );

    return (
      (parentIsHardEdge || parentIsAffinity) && ElementApi.isElement(parent)
    );
  })();

  const nodeEntry: NodeEntry<TElement | TText> = isAffinityInlineElement
    ? [parent!, PathApi.parent(cursor.path)]
    : [NodeApi.get(editor, cursor.path)!, cursor.path];

  if (
    edge === 'start' &&
    cursor.path.at(-1) === 0 &&
    !isAffinityInlineElement
  ) {
    return [null, nodeEntry];
  }

  const siblingPath =
    edge === 'end' ? Path.next(nodeEntry[1]) : Path.previous(nodeEntry[1]);
  const siblingNode = NodeApi.get<TText>(editor, siblingPath);

  const siblingEntry: NodeEntry<TText> | null = siblingNode
    ? [siblingNode, siblingPath]
    : null;

  return edge === 'end' ? [nodeEntry, siblingEntry] : [siblingEntry, nodeEntry];
};
