import { setNodes } from '@udecode/plate-common';
import { getPlatePluginType, SPEditor, TNode } from '@udecode/plate-core';
import { ELEMENT_LIC, getListRoot } from '@udecode/plate-list';
import { Editor, NodeEntry } from 'slate';
import { getHandledMarks } from '../queries/getHandledMarks';
import { getLevel } from '../queries/getLevel';

export const normalizeLicStyles = (
  editor: SPEditor,
  [node, path]: NodeEntry<TNode>
): void => {
  const licType = getPlatePluginType(editor, ELEMENT_LIC);
  if (node.type === licType) {
    const [rootNode] = getListRoot(editor, path) as NodeEntry;
    Editor.withoutNormalizing(editor, () => {
      const types = getHandledMarks(editor);
      types.forEach((key) => {
        if (!(node.prev && node.prev[key]?.dirty)) {
          const level = getLevel(path);
          const value =
            (rootNode as TNode).licStyles &&
            (rootNode as TNode).licStyles[level] &&
            (rootNode as TNode).licStyles[level][key];
          if (value) {
            setNodes(editor, { [key]: value }, { at: path });
          }
        }
      });
    });
  }
};
