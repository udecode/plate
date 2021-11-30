import { EditorNodesOptions, getNodes, getParent } from '@udecode/plate-common';
import { getPlatePluginType, PlateEditor } from '@udecode/plate-core';
import { Editor, Path, PathRef } from 'slate';
import { ELEMENT_LIC } from '../defaults';
import { isListNested } from '../queries/isListNested';
import { moveListItemDown } from './moveListItemDown';
import { moveListItemUp } from './moveListItemUp';

export type MoveListItemsOptions = {
  increase?: boolean;
  at?: EditorNodesOptions['at'];
};

export const moveListItems = (
  editor: PlateEditor,
  {
    increase = true,
    at = editor.selection ?? undefined,
  }: MoveListItemsOptions = {}
) => {
  // Get the selected lic
  const [...lics] = getNodes(editor, {
    at,
    match: {
      type: getPlatePluginType(editor, ELEMENT_LIC),
    },
  });

  if (!lics.length) return;

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
      highestLicPathRefs.push(Editor.pathRef(editor, licPath));
    }
  });

  const licPathRefsToMove = increase
    ? highestLicPathRefs
    : highestLicPathRefs.reverse();

  Editor.withoutNormalizing(editor, () => {
    licPathRefsToMove.forEach((licPathRef) => {
      const licPath = licPathRef.unref();
      if (!licPath) return;

      const listItem = getParent(editor, licPath);
      if (!listItem) return;
      const listEntry = getParent(editor, listItem[1]);

      if (increase) {
        moveListItemDown(editor, {
          list: listEntry as any,
          listItem: listItem as any,
        });
      } else if (listEntry && isListNested(editor, listEntry[1])) {
        moveListItemUp(editor, {
          list: listEntry as any,
          listItem: listItem as any,
        });
      }
    });
  });
};
