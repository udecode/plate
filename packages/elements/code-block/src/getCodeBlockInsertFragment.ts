import { findNode } from '@udecode/plate-common';
import { SPEditor, TDescendant } from '@udecode/plate-core';
import { Node, Transforms } from 'slate';
import { getCodeBlockType, getCodeLineType } from './options';

export function getCodeBlockInsertFragment(editor: SPEditor) {
  const { insertFragment } = editor;
  const codeBlockType = getCodeBlockType(editor);
  const codeLineType = getCodeLineType(editor);

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
