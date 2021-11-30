import { getNodes, setNodes } from '@udecode/plate-common';
import {
  getPlatePluginType,
  PlateEditor,
  TAncestor,
} from '@udecode/plate-core';
import { Editor, NodeEntry } from 'slate';
import { ELEMENT_LIC } from '../../defaults';
import { getListItemDepth, getListRoot } from '../../queries';
import { ListItemMarkerSelection } from '../../types';
import { setListItemContentMark } from './setListItemContentMark';

export const setListItemContentMarkByMarkerSelection = (
  editor: PlateEditor,
  licSelection: ListItemMarkerSelection,
  type: string,
  value: unknown
): void => {
  if (!licSelection.depth) {
    setListItemContentMark(editor, type, value, { at: licSelection.path });
  } else {
    const root = getListRoot(editor, licSelection.path) as NodeEntry<TAncestor>;
    const affectedLicDepth = getListItemDepth(licSelection.path);

    const licNodeEntries = Array.from(
      getNodes(editor, {
        at: root[1],
        match: { type: getPlatePluginType(editor, ELEMENT_LIC) },
      })
    ).filter(
      (nodeEntry) => getListItemDepth(nodeEntry[1]) === affectedLicDepth
    );

    Editor.withoutNormalizing(editor, () => {
      // here we can not use the setListItemContentMark since that would mark the lic as dirty
      licNodeEntries.forEach(([, path]) => {
        setNodes(editor, { [type]: value }, { at: path });
      });

      // set root node
      setNodes(
        editor,
        {
          licStyles: {
            ...(root[0].licStyles ?? {}),
            [affectedLicDepth]: {
              ...(root[0].licStyles
                ? root[0].licStyles[affectedLicDepth] ?? {}
                : {}),
              [type]: value,
            },
          },
        },
        { at: root[1] }
      );
    });
  }
};
