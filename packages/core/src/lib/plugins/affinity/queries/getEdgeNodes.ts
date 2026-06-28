import {
  type TElement,
  type TText,
  ElementApi,
  NodeApi,
  PathApi,
} from '@platejs/slate';
import { type NodeEntry, Path } from 'slate';

import type { SlateEditor } from '../../../editor';
import type { EdgeNodes } from '../types';

import { getPluginByType } from '../../../plugin/getSlatePlugin';

/**
 * When the cursor is at a mark edge, this function returns the inward node and
 * the outward node (if any). If the cursor is at the start of the text, then
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

  /** Inline elements */

  const isAffinityInlineElement = (() => {
    if (!parent || !ElementApi.isElement(parent)) return false;

    const parentAffinity = getPluginByType(editor, parent.type)?.rules.selection
      ?.affinity;

    return parentAffinity === 'hard' || parentAffinity === 'directional';
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
