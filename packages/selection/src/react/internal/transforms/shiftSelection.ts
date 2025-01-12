import { PathApi } from '@udecode/plate';
import { type PlateEditor, getEditorPlugin } from '@udecode/plate/react';

import { BlockSelectionPlugin } from '../../BlockSelectionPlugin';

/**
 * SHIFT-based expand-or-shrink selection.
 *
 * SHIFT + DOWN:
 *
 * - If anchor is top-most in the selection => expand down (add block below the
 *   bottom-most)
 * - Otherwise => shrink from top-most (unless top-most is anchor).
 *
 * SHIFT + UP:
 *
 * - If anchor is bottom-most => expand up (add block above top-most)
 * - Otherwise => shrink from bottom-most (unless bottom-most is anchor).
 */
export const shiftSelection = (
  editor: PlateEditor,
  direction: 'down' | 'up'
) => {
  const { api, getOption, getOptions, setOption } = getEditorPlugin(
    editor,
    BlockSelectionPlugin
  );

  const blocks = api.blockSelection.getNodes(); // already sorted top→bottom if your plugin does that

  if (blocks.length === 0) return;

  // top-most, bottom-most
  const [topNode, topPath] = blocks[0];
  const [bottomNode, bottomPath] = blocks.at(-1)!;

  let anchorId = getOptions().anchorId as string | undefined;

  // If no anchor, default anchor to bottom if SHIFT+up, or top if SHIFT+down (arbitrary choice).
  if (!anchorId) {
    anchorId = direction === 'up' ? bottomNode.id : topNode.id;
    setOption('anchorId', anchorId);
  }

  // find anchor index in the selection
  const anchorIndex = blocks.findIndex(([n]) => n.id === anchorId);

  if (anchorIndex < 0) {
    // re-anchor if anchor not found
    setOption('anchorId', bottomNode.id);

    return;
  }

  const anchorIsTop = anchorIndex === 0;
  const anchorIsBottom = anchorIndex === blocks.length - 1;
  const newSelected = new Set(getOption('selectedIds'));

  if (direction === 'down') {
    if (anchorIsTop) {
      // expand down => add block below bottom-most
      const belowPath = PathApi.next(bottomPath);

      if (!belowPath) return;

      const belowEntry = editor.api.block({ at: belowPath, highest: true });

      if (!belowEntry) return;

      const [belowNode] = belowEntry;

      if (belowNode.id) {
        newSelected.add(belowNode.id as string);
      }
    } else {
      // shrink => remove top-most (unless anchor)
      if (topNode.id && topNode.id !== anchorId) {
        newSelected.delete(topNode.id);
      }
    }

    newSelected.add(anchorId!);
    setOption('selectedIds', newSelected);
  } else {
    // direction === 'up'
    if (anchorIsBottom) {
      // expand up => add block above top-most
      const abovePath = PathApi.previous(topPath);

      if (!abovePath) return;

      const aboveEntry = editor.api.block({ at: abovePath, highest: true });

      if (!aboveEntry) return;

      const [aboveNode] = aboveEntry;

      if (aboveNode.id) {
        newSelected.add(aboveNode.id as string);
      }
    } else {
      // shrink => remove bottom-most
      if (bottomNode.id && bottomNode.id !== anchorId) {
        newSelected.delete(bottomNode.id);
      }
    }

    newSelected.add(anchorId!);
    setOption('selectedIds', newSelected);
  }
};
