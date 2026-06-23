import type { SlateEditor } from '@platejs/core';
import {
  type Element,
  type ElementEntry,
  type Location,
  type Path,
  type PathRef,
  type Span,
  PathApi,
} from '@platejs/slate';
import { KEYS } from '@platejs/utils';

import { runWithoutNormalizing } from '../internal/runWithoutNormalizing';
import { isListNested } from '../queries/isListNested';
import { moveListItemDown } from './moveListItemDown';
import { moveListItemUp } from './moveListItemUp';
import { removeFirstListItem } from './removeFirstListItem';

export type MoveListItemsOptions = {
  at?: Location | Span;
  enableResetOnShiftTab?: boolean;
  increase?: boolean;
};

export const moveListItems = (
  editor: SlateEditor,
  {
    at = editor.selection ?? undefined,
    enableResetOnShiftTab,
    increase = true,
  }: MoveListItemsOptions = {}
) => {
  const _nodes = editor.api.nodes({
    at,
    match: (node) => node.type === editor.getType(KEYS.lic),
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
      highestLicPathRefs.push(editor.api.pathRef(licPath));
    }
  });

  const licPathRefsToMove = increase
    ? highestLicPathRefs
    : highestLicPathRefs.reverse();

  let moved = false;

  editor.update((tx) => {
    runWithoutNormalizing(tx, () => {
      const getParentElementEntry = (path: Path): ElementEntry | undefined =>
        editor.api.parent<Element>(path);

      licPathRefsToMove.forEach((licPathRef) => {
        const licPath = licPathRef.unref();

        if (!licPath) return;

        const listItem = getParentElementEntry(licPath);

        if (!listItem) return;

        const parentList = getParentElementEntry(listItem[1]);

        if (!parentList) return;

        let didMove: boolean | undefined;

        if (increase) {
          didMove = moveListItemDown(editor, {
            list: parentList,
            listItem,
          });
        } else if (isListNested(editor, parentList[1])) {
          // un-indent a sub-list item
          didMove = moveListItemUp(editor, {
            list: parentList,
            listItem,
          });
        } else if (enableResetOnShiftTab) {
          // unindenting a top level list item, effectively breaking apart the list.
          didMove = removeFirstListItem(editor, {
            list: parentList,
            listItem,
          });
        }

        moved = didMove || moved;
      });
    });
  });

  return moved;
};
