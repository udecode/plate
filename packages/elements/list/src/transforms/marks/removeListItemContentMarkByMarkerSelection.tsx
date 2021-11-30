import { setNodes } from '@udecode/plate-common';
import { PlateEditor, TAncestor } from '@udecode/plate-core';
import { castArray } from 'lodash';
import { Editor, NodeEntry, Transforms } from 'slate';
import { getListItemDepth, getListRoot } from '../../queries';
import { ListItemMarkerSelection } from '../../types';
import { removeListItemContentMark } from './removeListItemContentMark';

export const removeListItemContentMarkByMarkerSelection = (
  editor: PlateEditor,
  type: string | string[],
  licSelection: ListItemMarkerSelection
): void => {
  const types = castArray(type);
  if (!licSelection.depth) {
    Editor.withoutNormalizing(editor, () => {
      Transforms.deselect(editor);
      removeListItemContentMark(editor, types, { at: licSelection.path });
    });
  } else {
    const root = getListRoot(editor, licSelection.path) as NodeEntry<TAncestor>;
    const affectedLicDepth = getListItemDepth(licSelection.path);

    const licStyles = root[0].licStyles ?? {};

    types.forEach((t) => {
      delete licStyles[t];
    });

    Editor.withoutNormalizing(editor, () => {
      removeListItemContentMark(editor, types, {
        at: root[1],
        filter: (nodeEntry) =>
          getListItemDepth(nodeEntry[1]) === affectedLicDepth,
      });

      // set root node
      setNodes(
        editor,
        {
          licStyles,
        },
        { at: root[1] }
      );
    });
  }
};
