import { getNodes, getParent } from '@udecode/slate-plugins-common';
import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
import { NodeEntry, Path } from 'slate';
import { ELEMENT_LIC } from '../defaults';
import { moveListItemDown } from './moveListItemDown';
import { moveListItemUp } from './moveListItemUp';

export const moveListItem = (editor: SPEditor, increase = true) => {
  // Get the selected lic
  const [...lics] = getNodes(editor, {
    at: editor.selection!,
    match: {
      type: getSlatePluginType(editor, ELEMENT_LIC),
    },
  });

  if (!lics.length) return;

  const highestLics: NodeEntry[] = [];

  // Filter out the nested lic, we just need to move the highest ones
  lics.forEach((lic) => {
    const licPath = lic[1];
    const liPath = Path.parent(licPath);

    const isAncestor = highestLics.some((highestLic) => {
      const highestLiPath = Path.parent(highestLic[1]);

      return Path.isAncestor(highestLiPath, liPath);
    });
    if (!isAncestor) {
      highestLics.push(lic);
    }
  });

  highestLics.reverse().forEach((highestLic) => {
    const listItem = getParent(editor, highestLic[1]);
    if (!listItem) return;
    const listEntry = getParent(editor, listItem[1]);

    if (increase) {
      moveListItemDown(editor, {
        list: listEntry as any,
        listItem: listItem as any,
      });
    } else {
      moveListItemUp(editor, {
        list: listEntry as any,
        listItem: listItem as any,
      });
    }
  });
};
