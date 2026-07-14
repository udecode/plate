import type { BaseEditor } from '@platejs/core';
import type { EditorNodesOptions } from '@platejs/plite';
import { type Element, type Path, type PathRef, PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListTransaction } from '../BaseListPlugin';

import { isListNested } from '../queries/isListNested';
import { moveListItemDown } from './moveListItemDown';
import { moveListItemUp } from './moveListItemUp';
import { removeFirstListItem } from './removeFirstListItem';

export type MoveListItemsOptions = {
  at?: EditorNodesOptions<Element>['at'];
  enableResetOnShiftTab?: boolean;
  increase?: boolean;
};

export const moveListItems = (
  editor: BaseEditor,
  tx: ListTransaction,
  {
    at = editor.read.selection() ?? undefined,
    enableResetOnShiftTab,
    increase = true,
  }: MoveListItemsOptions = {}
) => {
  const _nodes = editor.read.nodes.entries({
    at,
    match: {
      type: editor.getType(KEYS.lic),
    },
  });

  // Get the selected lic
  const lics = Array.from(_nodes);

  if (lics.length === 0) return;

  const highestLicPaths: Path[] = [];
  const highestLicPathRefs: PathRef[] = [];

  // Filter out the nested lic, we just need to move the highest ones
  lics.forEach((lic) => {
    const licPath = lic[1];
    const liPath = PathApi.parent(licPath);

    const isAncestor = highestLicPaths.some((path) => {
      const highestLiPath = PathApi.parent(path);

      return PathApi.isAncestor(highestLiPath, liPath);
    });

    if (!isAncestor) {
      highestLicPaths.push(licPath);
      highestLicPathRefs.push(tx.refs.path(licPath));
    }
  });

  const licPathRefsToMove = increase
    ? highestLicPathRefs
    : highestLicPathRefs.reverse();

  {
    let moved = false;

    licPathRefsToMove.forEach((licPathRef) => {
      const licPath = licPathRef.unref();

      if (!licPath) return;

      const listItem = editor.read.nodes.parent(licPath);

      if (!listItem) return;

      const parentList = editor.read.nodes.parent(listItem[1]);

      if (!parentList) return;

      let itemMoved = false;

      if (increase) {
        itemMoved = !!moveListItemDown(editor, tx, {
          list: parentList as [Element, Path],
          listItem: listItem as [Element, Path],
        });
      } else if (isListNested(editor, parentList[1])) {
        // un-indent a sub-list item
        itemMoved = !!moveListItemUp(editor, tx, {
          list: parentList as [Element, Path],
          listItem: listItem as [Element, Path],
        });
      } else if (enableResetOnShiftTab) {
        // unindenting a top level list item, effectively breaking apart the list.
        itemMoved = removeFirstListItem(editor, tx, {
          list: parentList as [Element, Path],
          listItem: listItem as [Element, Path],
        });
      }

      moved = itemMoved || moved;
    });

    return moved;
  }
};
