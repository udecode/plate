import { findNode } from '@udecode/plate-common';
import { getPlatePluginType, SPEditor, TDescendant } from '@udecode/plate-core';
import { Node, Transforms } from 'slate';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from './defaults';

export function getCodeBlockInsertFragment(editor: SPEditor) {
  const { insertFragment } = editor;
  const codeBlockType = getPlatePluginType(editor, ELEMENT_CODE_BLOCK);
  const codeLineType = getPlatePluginType(editor, ELEMENT_CODE_LINE);

  function convertNodeToCodeLine(node: TDescendant) {
    return {
      type: codeLineType,
      children: [{ text: Node.string(node) }],
    };
  }

  function extractCodeLinesFromCodeBlock(node: TDescendant) {
    return node.children;
  }

  return (fragment: TDescendant[]) => {
    const inCodeLine = findNode(editor, { match: { type: codeLineType } });
    if (!inCodeLine) {
      return insertFragment(fragment);
    }

    return Transforms.insertFragment(
      editor,
      fragment.flatMap((node) =>
        node.type === codeBlockType
          ? extractCodeLinesFromCodeBlock(node)
          : convertNodeToCodeLine(node)
      )
    );
  };
}
