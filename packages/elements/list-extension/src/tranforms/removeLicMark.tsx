import { getNode, getNodes, setNodes } from '@udecode/plate-common';
import {
  getPlatePluginType,
  SPEditor,
  TAncestor,
  TNode,
} from '@udecode/plate-core';
import { ELEMENT_LIC, getListRoot } from '@udecode/plate-list';
import { castArray } from 'lodash';
import { Editor, NodeEntry, Transforms } from 'slate';
import { LicSelection } from '../atoms/licSelection';
import { getLevel } from '../queries/getLevel';
import { clearNodeMarks } from './clearNodeMarks';

export const removeLicMark = (
  editor: SPEditor,
  licSelection: LicSelection,
  type: string | string[]
): void => {
  const types = castArray(type);
  if (!licSelection.level) {
    const node = getNode(editor, licSelection.path) as TNode;
    Editor.withoutNormalizing(editor, () => {
      Transforms.deselect(editor);
      clearNodeMarks(editor, types, node, licSelection.path);
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
      licNodeEntries.forEach(([node, path]) => {
        clearNodeMarks(editor, types, node, path);
      });
      setNodes(
        editor,
        {
          licStyles: {},
        },
        { at: root[1] }
      );
    });
  }
};
