import type { BaseEditor } from '@platejs/core';
import {
  ElementApi,
  NodeApi,
  RangeApi,
  type Descendant,
  type Path,
  type Range,
  type Selection,
} from '@platejs/plite';
import type { TCaptionElement } from '@platejs/utils';

const arrowUpSelectionMoves = new WeakSet<BaseEditor>();

type SetCaptionFocusPath = (path: Path) => void;

/** TODO: tests https://github.com/udecode/editor-protocol/issues/79 */

/**
 * Selection table:
 *
 * - If anchor is in table, focus in a block before: set focus to start of table
 * - If anchor is in table, focus in a block after: set focus to end of table
 * - If focus is in table, anchor in a block before: set focus to end of table
 * - If focus is in table, anchor in a block after: set focus to the point before
 *   start of table
 */
export const markCaptionArrowUpSelectionMove = (editor: BaseEditor) => {
  arrowUpSelectionMoves.add(editor);

  return false;
};

export const focusCaptionAfterArrowUpSelectionMove = (
  editor: BaseEditor,
  targetTypes: readonly string[],
  selection: Selection,
  setFocusPath: SetCaptionFocusPath
) => {
  if (!arrowUpSelectionMoves.delete(editor)) return false;

  if (!selection || !RangeApi.isCollapsed(selection)) return false;

  const entry = findCaptionEntry(editor, targetTypes, selection);

  if (!entry || !hasCaptionText(entry[0])) return false;

  setTimeout(() => {
    setFocusPath(entry[1]);
  }, 0);

  return true;
};

export const focusCaptionFromCurrentBlock = (
  editor: BaseEditor,
  targetTypes: readonly string[],
  setFocusPath: SetCaptionFocusPath
) => {
  const entry = findCaptionBlock(editor, targetTypes);

  if (!entry) return false;

  setFocusPath(entry[1]);

  return true;
};

const findCaptionEntry = (
  editor: BaseEditor,
  targetTypes: readonly string[],
  at: Range
) =>
  editor.read.nodes.above<TCaptionElement>({
    at,
    match: {
      type: targetTypes,
    },
  });

const findCaptionBlock = (editor: BaseEditor, targetTypes: readonly string[]) =>
  editor.read.nodes.block<TCaptionElement>({
    match: {
      type: targetTypes,
    },
  });

const hasCaptionText = (node: unknown) => {
  if (!ElementApi.isElement(node)) return false;

  const caption = (node as Partial<TCaptionElement>).caption;

  return (
    Array.isArray(caption) &&
    caption.some((child: Descendant) => NodeApi.string(child).length > 0)
  );
};
