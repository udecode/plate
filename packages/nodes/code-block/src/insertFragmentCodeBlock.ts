import {
  findNode,
  getPluginType,
  PlateEditor,
  TDescendant,
  Value,
} from '@udecode/plate-core';
import { Node, Transforms } from 'slate';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from './constants';

export const insertFragmentCodeBlock = <V extends Value>(
  editor: PlateEditor<V>
) => {
  const { insertFragment } = editor;
  const codeBlockType = getPluginType(editor, ELEMENT_CODE_BLOCK);
  const codeLineType = getPluginType(editor, ELEMENT_CODE_LINE);

  function convertNodeToCodeLine(node: TDescendant) {
    return {
      type: codeLineType,
      children: [{ text: Node.string(node) }],
    };
  }

  function extractCodeLinesFromCodeBlock(node: TDescendant) {
    return node.children;
  }

  return (fragment: Node[]) => {
    const inCodeLine = findNode(editor, { match: { type: codeLineType } });
    if (!inCodeLine) {
      return insertFragment(fragment);
    }

    return Transforms.insertFragment(
      editor,
      fragment.flatMap((node) => {
        const element = node as TDescendant;

        return element.type === codeBlockType
          ? extractCodeLinesFromCodeBlock(element)
          : convertNodeToCodeLine(element);
      })
    );
  };
};
