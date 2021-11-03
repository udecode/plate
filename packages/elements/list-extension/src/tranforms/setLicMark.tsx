import { getNode, getNodes, setNodes } from '@udecode/plate-common';
import {
  getPlatePluginType,
  SPEditor,
  TAncestor,
  TNode,
} from '@udecode/plate-core';
import { ELEMENT_LIC, getListRoot } from '@udecode/plate-list';
import { Editor, NodeEntry, Transforms } from 'slate';
import { LicSelection } from '../atoms/licSelection';
import { getLevel } from '../queries/getLevel';

export const setLicMark = (
  editor: SPEditor,
  licSelection: LicSelection,
  type: string,
  value: unknown
): void => {
  if (!licSelection.level) {
    const node = getNode(editor, licSelection.path) as TNode;
    const prev = node.prev ?? {};
    Editor.withoutNormalizing(editor, () => {
      Transforms.deselect(editor);
      setNodes(
        editor,
        {
          [type]: value,
          prev: {
            ...(prev ?? {}),
            [type]: { ...(prev[type] ?? {}), dirty: true },
          },
        },
        { at: licSelection.path }
      );
    });
  } else {
    const root = getListRoot(editor, licSelection.path) as NodeEntry<TAncestor>;
    const affectedLicLevel = getLevel(licSelection.path);

    const licNodeEntries = Array.from(
      getNodes(editor, {
        at: root[1],
        match: { type: getPlatePluginType(editor, ELEMENT_LIC) },
      })
    ).filter((nodeEntry) => getLevel(nodeEntry[1]) === affectedLicLevel);

    Editor.withoutNormalizing(editor, () => {
      Transforms.deselect(editor);
      licNodeEntries.forEach(([, path]) => {
        setNodes(editor, { [type]: value }, { at: path });
      });
      setNodes(
        editor,
        {
          licStyles: {
            ...(root[0].licStyles ?? {}),
            [affectedLicLevel]: {
              ...(root[0].licStyles
                ? root[0].licStyles[affectedLicLevel] ?? {}
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
