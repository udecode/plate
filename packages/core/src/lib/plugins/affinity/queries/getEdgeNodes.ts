import {
  type Element,
  type EditorStateView,
  ElementApi,
  type NodeEntry,
  type Text,
  PathApi,
} from '@platejs/plite';

import type { BaseEditor } from '../../../editor';
import type { EdgeNodes } from '../types';

import { getPluginByType } from '../../../plugin';

/**
 * When the cursor is at a mark edge, this function returns the inward node and
 * the outward node (if any). If the cursor is at the start of the text, then
 * the node before the text is returned. If the cursor is at the end of the
 * text, then the node after the text is returned. Otherwise, null is returned.
 */
type EdgeNodeState = Pick<
  EditorStateView,
  'nodes' | 'points' | 'ranges' | 'selection'
>;

export const getEdgeNodes = (
  editor: BaseEditor,
  state: EdgeNodeState = editor.read
): EdgeNodes | null => {
  if (!state.selection.isCollapsed()) return null;

  const selection = state.selection();
  if (!selection) return null;

  const cursor = selection.anchor;

  const textRange = state.ranges.get(cursor.path);

  if (!textRange) return null;

  const edge = state.points.isStart(cursor, textRange)
    ? 'start'
    : state.points.isEnd(cursor, textRange)
      ? 'end'
      : null;

  if (!edge) return null;

  const parent: Element | null =
    (state.nodes.parent(cursor.path)?.[0] as Element | undefined) ?? null;

  /** Inline elements */

  const isAffinityInlineElement = (() => {
    if (!parent || !ElementApi.isElement(parent)) return false;

    const parentAffinity = getPluginByType(editor, parent.type)?.rules.selection
      ?.affinity;

    return parentAffinity === 'hard' || parentAffinity === 'directional';
  })();

  const nodeEntry: NodeEntry<Element | Text> = isAffinityInlineElement
    ? [parent!, PathApi.parent(cursor.path)]
    : [state.nodes.get<Element | Text>(cursor.path)![0], cursor.path];

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
      : PathApi.previous(nodeEntry[1]);
  const siblingNode = state.nodes.get<Text>(siblingPath)?.[0];

  const siblingEntry: NodeEntry<Text> | null = siblingNode
    ? [siblingNode, siblingPath]
    : null;

  return edge === 'end' ? [nodeEntry, siblingEntry] : [siblingEntry, nodeEntry];
};
