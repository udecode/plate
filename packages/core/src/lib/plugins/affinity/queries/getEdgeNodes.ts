import {
  type Element,
  type NodeEntry,
  type Text,
  ElementApi,
  PathApi,
  RangeApi,
} from '@platejs/slate';

import type { SlateEditor } from '../../../editor';
import type { EdgeNodes } from '../types';

import {
  getEditorNode,
  getEditorParent,
  getEditorRange,
  isEditorEnd,
  isEditorSelectionCollapsed,
} from '../../../../internal/utils/runtimeEditorQueries';
import { getPluginByType } from '../../../plugin/getSlatePlugin';

/**
 * When the cursor is at a mark edge, this function returns the inward node and
 * the outward node (if any). If the cursor is at the start of the text, then
 * the node before the text is returned. If the cursor is at the end of the
 * text, then the node after the text is returned. Otherwise, null is returned.
 */
export const getEdgeNodes = (editor: SlateEditor): EdgeNodes | null => {
  if (!isEditorSelectionCollapsed(editor)) return null;

  const cursor = editor.selection!.anchor;

  const textRange = getEditorRange(editor, cursor.path);

  if (!textRange) return null;

  const edge = RangeApi.isCollapsed({
    anchor: cursor,
    focus: textRange.anchor,
  })
    ? 'start'
    : isEditorEnd(editor, cursor, textRange)
      ? 'end'
      : null;

  if (!edge) return null;

  const parentEntry = getEditorParent<Element>(editor, cursor.path);
  const parent = parentEntry?.[0] ?? null;

  /** Inline elements */

  const isAffinityInlineElement = (() => {
    if (!parent || !ElementApi.isElement(parent)) return false;

    const parentAffinity = getPluginByType(editor, parent.type)?.rules.selection
      ?.affinity;

    return parentAffinity === 'hard' || parentAffinity === 'directional';
  })();

  const nodeEntry: NodeEntry<Element | Text> | null = isAffinityInlineElement
    ? (parentEntry ?? null)
    : (getEditorNode<Element | Text>(editor, cursor.path) ?? null);

  if (!nodeEntry) return null;

  if (
    edge === 'start' &&
    cursor.path.at(-1) === 0 &&
    !isAffinityInlineElement
  ) {
    return [null, nodeEntry];
  }

  const siblingPath =
    edge === 'end'
      ? PathApi.next(nodeEntry[1])
      : PathApi.hasPrevious(nodeEntry[1])
        ? PathApi.previous(nodeEntry[1])
        : undefined;
  if (!siblingPath) {
    return edge === 'end' ? [nodeEntry, null] : [null, nodeEntry];
  }
  const siblingNode = getEditorNode<Text>(editor, siblingPath)?.[0];

  const siblingEntry: NodeEntry<Text> | null = siblingNode
    ? [siblingNode, siblingPath]
    : null;

  return edge === 'end' ? [nodeEntry, siblingEntry] : [siblingEntry, nodeEntry];
};
