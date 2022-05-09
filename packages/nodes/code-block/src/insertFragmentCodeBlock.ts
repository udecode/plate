import {
  EDescendant,
  findNode,
  getNodeString,
  getPluginType,
  insertFragment,
  PlateEditor,
  TElement,
  Value,
} from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from './constants';

export const insertFragmentCodeBlock = <V extends Value>(
  editor: PlateEditor<V>
) => {
  const { insertFragment: _insertFragment } = editor;
  const codeBlockType = getPluginType(editor, ELEMENT_CODE_BLOCK);
  const codeLineType = getPluginType(editor, ELEMENT_CODE_LINE);

  function convertNodeToCodeLine(node: TElement): TElement {
    return {
      type: codeLineType,
      children: [{ text: getNodeString(node) }],
    };
  }

  function extractCodeLinesFromCodeBlock(node: TElement) {
    return node.children as TElement[];
  }

  return (fragment: EDescendant<V>[]) => {
    const inCodeLine = findNode(editor, { match: { type: codeLineType } });
    if (!inCodeLine) {
      return _insertFragment(fragment);
    }

    return insertFragment(
      editor,
      fragment.flatMap((node) => {
        const element = node as TElement;

        return element.type === codeBlockType
          ? extractCodeLinesFromCodeBlock(element)
          : convertNodeToCodeLine(element);
      })
    );
  };
};
