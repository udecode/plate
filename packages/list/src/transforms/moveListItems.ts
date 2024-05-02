import {
  createPathRef,
  getNodeEntries,
  GetNodeEntriesOptions,
  getParentNode,
  getPluginType,
  PlateEditor,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common/server';
import { Path, PathRef } from 'slate';

import { ELEMENT_LIC } from '../createListPlugin';
import { isListNested } from '../queries/isListNested';
import { moveListItemDown } from './moveListItemDown';
import { moveListItemUp } from './moveListItemUp';
import { removeFirstListItem } from './removeFirstListItem';

export type MoveListItemsOptions = {
  increase?: boolean;
  at?: GetNodeEntriesOptions['at'];
  enableResetOnShiftTab?: boolean;
};

export const moveListItems = <V extends Value>(
  editor: PlateEditor<V>,
  {
    increase = true,
    at = editor.selection ?? undefined,
    enableResetOnShiftTab,
  }: MoveListItemsOptions = {}
) => {
  const _nodes = getNodeEntries(editor, {
    at,
    match: {
      type: getPluginType(editor, ELEMENT_LIC),
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
    const liPath = Path.parent(licPath);

    const isAncestor = highestLicPaths.some((path) => {
      const highestLiPath = Path.parent(path);

      return Path.isAncestor(highestLiPath, liPath);
    });
    if (!isAncestor) {
      highestLicPaths.push(licPath);
      highestLicPathRefs.push(createPathRef(editor, licPath));
    }
  });

  const licPathRefsToMove = increase
    ? highestLicPathRefs
    : highestLicPathRefs.reverse();

  return withoutNormalizing(editor, () => {
    let moved = false;

    licPathRefsToMove.forEach((licPathRef) => {
      const licPath = licPathRef.unref();
      if (!licPath) return;

      const listItem = getParentNode(editor, licPath);
      if (!listItem) return;

      const parentList = getParentNode(editor, listItem[1]);
      if (!parentList) return;

      let _moved: any;

      if (increase) {
        _moved = moveListItemDown(editor, {
          list: parentList as any,
          listItem: listItem as any,
        });
      } else if (isListNested(editor, parentList[1])) {
        // un-indent a sub-list item
        _moved = moveListItemUp(editor, {
          list: parentList as any,
          listItem: listItem as any,
        });
      } else if (enableResetOnShiftTab) {
        // unindenting a top level list item, effectively breaking apart the list.
        _moved = removeFirstListItem(editor, {
          list: parentList as any,
          listItem: listItem as any,
        });
      }

      moved = _moved || moved;
    });

    return moved;
  });
};
