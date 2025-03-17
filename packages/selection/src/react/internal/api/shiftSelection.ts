import { type TElement, PathApi } from '@udecode/plate';
import { type PlateEditor, getEditorPlugin } from '@udecode/plate/react';

import { BlockSelectionPlugin } from '../../BlockSelectionPlugin';

/**
 * SHIFT-based expand-or-shrink selection.
 *
 * SHIFT + DOWN:
 *
 * - If anchor is top-most in the selection => expand down (add block below
 *   bottom-most).
 * - Otherwise => shrink from top-most (unless top-most is the anchor).
 *
 * SHIFT + UP:
 *
 * - If anchor is bottom-most => expand up (add block above top-most).
 * - Otherwise => shrink from bottom-most (unless bottom-most is the anchor).
 */
export const shiftSelection = (
  editor: PlateEditor,
  direction: 'down' | 'up'
) => {
  const { api, getOption, getOptions, setOption } = getEditorPlugin(
    editor,
    BlockSelectionPlugin
  );

  const blocks = api.blockSelection.getNodes();

  if (blocks.length === 0) return;

  // Identify the top-most and bottom-most blocks in the current selection.
  const [topNode, topPath] = blocks[0];
  const [bottomNode, bottomPath] = blocks.at(-1)!;
  let anchorId = getOptions().anchorId;

  // If no anchor is set, default to bottom-most if SHIFT+UP, else top-most if SHIFT+DOWN.
  if (!anchorId) {
    anchorId = (direction === 'up' ? bottomNode.id : topNode.id) as string;
    setOption('anchorId', anchorId);
  }

  // Find the anchor block within the current selection array.
  const anchorIndex = blocks.findIndex(([node]) => node.id === anchorId);

  if (anchorIndex === -1) {
    // If anchor not found in the current selection, fallback:
    setOption('anchorId', bottomNode.id as string);

    return;
  }

  const anchorIsTop = anchorIndex === 0;
  const anchorIsBottom = anchorIndex === blocks.length - 1;

  const newSelected = new Set(getOption('selectedIds'));

  if (direction === 'down') {
    // SHIFT+DOWN
    if (anchorIsTop) {
      // Expand down => add block below the bottom-most
      const belowEntry = editor.api.next({
        at: bottomPath,
        mode: 'highest',
        match: (n, p) =>
          api.blockSelection.isSelectable(n as any, p) &&
          !PathApi.isAncestor(p, bottomPath),
      });

      if (!belowEntry) return;

      const [belowNode] = belowEntry;

      newSelected.add(belowNode.id as string);
    } else {
      // anchor is not top => shrink from top-most
      // remove the top-most from selection unless it's the anchor.
      if (topNode.id && topNode.id !== anchorId) {
        newSelected.delete(topNode.id as string);
      }
    }
  } else {
    // SHIFT+UP
    if (anchorIsBottom) {
      // Expand up => add block above the top-most
      const aboveEntry = editor.api.previous<TElement & { id: string }>({
        at: topPath,
        from: 'parent',
        match: api.blockSelection.isSelectable,
      });

      if (!aboveEntry) return;

      const [aboveNode, abovePath] = aboveEntry;

      if (PathApi.isAncestor(abovePath, topPath)) {
        newSelected.forEach((id) => {
          const entry = editor.api.node({ id, at: abovePath });

          if (!entry) return;
          if (PathApi.isDescendant(entry[1], abovePath)) {
            newSelected.delete(id);

            if (id === anchorId) {
              anchorId = aboveNode.id;
              setOption('anchorId', anchorId);
            }
          }
        });
      }

      newSelected.add(aboveNode.id);
    } else {
      // anchor is not bottom => shrink from bottom-most
      if (bottomNode.id && bottomNode.id !== anchorId) {
        newSelected.delete(bottomNode.id as string);
      }
    }
  }

  // Always ensure the anchor remains selected
  newSelected.add(anchorId!);

  setOption('selectedIds', newSelected);
};
