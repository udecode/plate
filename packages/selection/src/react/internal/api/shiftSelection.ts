import type { BaseEditor } from '@platejs/core';
import type { TIdElement } from '@platejs/utils';

import { ElementApi, PathApi } from '@platejs/plite';

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
  editor: BaseEditor,
  direction: 'down' | 'up'
) => {
  const { api, getOption, getOptions, setOption } =
    editor.plugin(BlockSelectionPlugin);
  const blocks = api.getNodes();

  if (blocks.length === 0) return;

  const [topNode, topPath] = blocks[0];
  const [bottomNode, bottomPath] = blocks.at(-1)!;
  let anchorId = getOptions().anchorId;

  if (!anchorId) {
    anchorId = (direction === 'up' ? bottomNode.id : topNode.id) as string;
    setOption('anchorId', anchorId);
  }

  const anchorIndex = blocks.findIndex(([node]) => node.id === anchorId);

  if (anchorIndex === -1) {
    setOption('anchorId', bottomNode.id as string);
    return;
  }

  const anchorIsTop = anchorIndex === 0;
  const anchorIsBottom = anchorIndex === blocks.length - 1;
  const newSelected = new Set(getOption('selectedIds'));

  if (direction === 'down') {
    if (anchorIsTop) {
      const belowEntry = editor.read.nodes.next({
        at: bottomPath,
        mode: 'highest',
        match: (node, path) =>
          ElementApi.isElement(node) &&
          api.isSelectable(node, path) &&
          !PathApi.isAncestor(path, bottomPath),
      });

      if (!belowEntry) return;

      const [belowNode] = belowEntry;

      newSelected.add(belowNode.id as string);
    } else if (topNode.id && topNode.id !== anchorId) {
      newSelected.delete(topNode.id as string);
    }
  } else if (anchorIsBottom) {
    const aboveEntry = editor.read.nodes.previous<TIdElement>({
      at: topPath,
      from: 'parent',
      match: (node, path) =>
        ElementApi.isElement(node) && api.isSelectable(node, path),
    });

    if (!aboveEntry) return;

    const [aboveNode, abovePath] = aboveEntry;

    if (PathApi.isAncestor(abovePath, topPath)) {
      newSelected.forEach((id) => {
        const entry = editor.read.nodes.find({
          at: abovePath,
          match: { id },
        });

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
  } else if (bottomNode.id && bottomNode.id !== anchorId) {
    newSelected.delete(bottomNode.id as string);
  }

  newSelected.add(anchorId!);
  setOption('selectedIds', newSelected);
};
