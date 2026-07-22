import type { BaseEditor } from '@platejs/core';
import type { EditorNodesOptions } from '@platejs/plite';
import { type Element, type Path, PathApi } from '@platejs/plite';
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
    at = tx.selection() ?? undefined,
    enableResetOnShiftTab,
    increase = true,
  }: MoveListItemsOptions = {}
) => {
  const _nodes = tx.nodes.entries<Element>({
    at,
    match: {
      type: editor.getType(KEYS.lic),
    },
  });

  // Get the selected lic
  const lics = Array.from(_nodes);

  if (lics.length === 0) return;

  const highestLicPaths: Path[] = [];

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
    }
  });

  const highestLicRefs = highestLicPaths.map((licPath) =>
    tx.refs.path(licPath, {
      association: 'forward',
      deletion: 'drop',
    })
  );
  const licRefsToMove = increase ? highestLicRefs : highestLicRefs.reverse();

  {
    let moved = false;

    licRefsToMove.forEach((licRef) => {
      const licPath = licRef.resolve();

      if (!licPath) return;

      const listItem = tx.nodes.parent<Element>(licPath);

      if (!listItem) return;

      const parentList = tx.nodes.parent<Element>(listItem[1]);

      if (!parentList) return;

      let itemMoved = false;

      if (increase) {
        itemMoved = !!moveListItemDown(editor, tx, {
          list: parentList,
          listItem,
        });
      } else if (isListNested(editor, parentList[1], tx)) {
        // un-indent a sub-list item
        itemMoved = !!moveListItemUp(editor, tx, {
          list: parentList,
          listItem,
        });
      } else if (enableResetOnShiftTab) {
        // unindenting a top level list item, effectively breaking apart the list.
        itemMoved = removeFirstListItem(editor, tx, {
          list: parentList,
          listItem,
        });
      }

      moved = itemMoved || moved;
    });

    return moved;
  }
};
