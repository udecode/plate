import {
  getPlugin,
  getPluginType,
  PlateEditor,
  setNodes,
  TNode,
} from '@udecode/plate-core';
import { Editor, NodeEntry } from 'slate';
import { ELEMENT_LIC, KEY_LIST } from '../createListPlugin';
import { getListItemDepth, getListRoot } from '../queries';
import { ListPlugin } from '../types';

export const normalizeListItemMarks = (
  editor: PlateEditor,
  [node, path]: NodeEntry<TNode>
): void => {
  const licType = getPluginType(editor, ELEMENT_LIC);
  const {
    options: { marks },
  } = getPlugin<Required<ListPlugin>>(editor, KEY_LIST);

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
