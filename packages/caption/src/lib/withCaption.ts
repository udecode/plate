import { type BaseEditor, getPluginTypes } from '@platejs/core';
import {
  ElementApi,
  NodeApi,
  RangeApi,
  type Descendant,
  type Path,
  type Range,
  type Selection,
  type SetSelectionOperation,
} from '@platejs/plite';
import type { TCaptionElement } from '@platejs/utils';

import type { CaptionConfig } from './BaseCaptionPlugin';

const arrowUpSelectionMoves = new WeakSet<BaseEditor>();

type CaptionOptions = CaptionConfig['options'];
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
  options: CaptionOptions,
  operation: SetSelectionOperation,
  setFocusPath: SetCaptionFocusPath
) => {
  if (!arrowUpSelectionMoves.delete(editor)) return false;

  const selection = getSetSelectionTarget(editor.read.selection(), operation);

  if (!selection || !RangeApi.isCollapsed(selection)) return false;

  const entry = findCaptionEntry(editor, options, selection);

  if (!entry || !hasCaptionText(entry[0])) return false;

  setTimeout(() => {
    setFocusPath(entry[1]);
  }, 0);

  return true;
};

export const focusCaptionFromCurrentBlock = (
  editor: BaseEditor,
  options: CaptionOptions,
  setFocusPath: SetCaptionFocusPath
) => {
  const entry = findCaptionBlock(editor, options);

  if (!entry) return false;

  setFocusPath(entry[1]);

  return true;
};

const findCaptionEntry = (
  editor: BaseEditor,
  options: CaptionOptions,
  at: Range
) =>
  editor.read.nodes.above<TCaptionElement>({
    at,
    match: (node) =>
      ElementApi.isElement(node) &&
      getPluginTypes(editor, options.query.allow).includes(node.type as string),
  });

const findCaptionBlock = (editor: BaseEditor, options: CaptionOptions) =>
  editor.read.nodes.block<TCaptionElement>({
    match: (node) =>
      ElementApi.isElement(node) &&
      getPluginTypes(editor, options.query.allow).includes(node.type as string),
  });

const getSetSelectionTarget = (
  selection: Selection,
  operation: SetSelectionOperation
): Range | null => {
  if (operation.newProperties == null) return null;
  if (RangeApi.isRange(operation.newProperties)) return operation.newProperties;
  if (!selection) return null;

  return {
    ...selection,
    ...operation.newProperties,
  };
};

const hasCaptionText = (node: unknown) => {
  if (!ElementApi.isElement(node)) return false;

  const caption = (node as Partial<TCaptionElement>).caption;

  return (
    Array.isArray(caption) &&
    caption.some((child: Descendant) => NodeApi.string(child).length > 0)
  );
};
