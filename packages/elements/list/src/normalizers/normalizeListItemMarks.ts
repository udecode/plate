import { setNodes } from '@udecode/plate-common';
import {
  getPlatePluginOptions,
  getPlatePluginType,
  PlateEditor,
  TNode,
} from '@udecode/plate-core';
import { Editor, NodeEntry } from 'slate';
import { ELEMENT_LIC, KEY_LIST } from '../defaults';
import { getListItemDepth, getListRoot } from '../queries';
import { WithListOptions } from '../types';

export const normalizeListItemMarks = (
  editor: PlateEditor,
  [node, path]: NodeEntry<TNode>
): void => {
  const licType = getPlatePluginType(editor, ELEMENT_LIC);
  const { marks } = getPlatePluginOptions<Required<WithListOptions>>(
    editor,
    KEY_LIST
  );

  if (node.type === licType) {
    const [rootNode] = getListRoot(editor, path) as NodeEntry;
    Editor.withoutNormalizing(editor, () => {
      const types = marks ? marks.map((value) => value.nodeKey) : [];
      types.forEach((key) => {
        if (!(node.prev && node.prev[key]?.dirty)) {
          const depth = getListItemDepth(path);
          const value =
            (rootNode as TNode).licStyles &&
            (rootNode as TNode).licStyles[depth] &&
            (rootNode as TNode).licStyles[depth][key];
          if (value) {
            setNodes(editor, { [key]: value }, { at: path });
          }
        }
      });
    });
  }
};
