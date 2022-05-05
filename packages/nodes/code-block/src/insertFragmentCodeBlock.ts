import {
  EElement,
  findNode,
  getPluginType,
  insertFragment,
  PlateEditor,
  TDescendant,
  Value,
} from '@udecode/plate-core';
import { Node } from 'slate';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from './constants';

export const insertFragmentCodeBlock = <V extends Value>(
  editor: PlateEditor<V>
) => {
  const { insertFragment: _insertFragment } = editor;
  const codeBlockType = getPluginType(editor, ELEMENT_CODE_BLOCK);
  const codeLineType = getPluginType(editor, ELEMENT_CODE_LINE);

  function convertNodeToCodeLine(node: EElement<V>) {
    return {
      type: codeLineType,
      children: [{ text: Node.string(node) }],
    };
  }

  function extractCodeLinesFromCodeBlock(node: EElement<V>) {
    return node.children;
  }

  return (fragment: TDescendant[]) => {
    const inCodeLine = findNode(editor, { match: { type: codeLineType } });
    if (!inCodeLine) {
      return _insertFragment(fragment);
    }

    return insertFragment(
      editor,
      fragment.flatMap((node) => {
        const element = node;

        return element.type === codeBlockType
          ? extractCodeLinesFromCodeBlock(element)
          : convertNodeToCodeLine(element);
      })
    );
  };
};
