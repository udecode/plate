import {
  type PlateEditor,
  type TDescendant,
  type TElement,
  getBlockAbove,
  getNodeString,
  getPluginType,
} from '@udecode/plate-common/server';

import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from './constants';

function extractCodeLinesFromCodeBlock(node: TElement) {
  return node.children as TElement[];
}

export const insertFragmentCodeBlock = (editor: PlateEditor) => {
  const { insertFragment } = editor;
  const codeBlockType = getPluginType(editor, ELEMENT_CODE_BLOCK);
  const codeLineType = getPluginType(editor, ELEMENT_CODE_LINE);

  function convertNodeToCodeLine(node: TElement): TElement {
    return {
      children: [{ text: getNodeString(node) }],
      type: codeLineType,
    };
  }

  return (fragment: TDescendant[]) => {
    const [blockAbove] = getBlockAbove<TElement>(editor) ?? [];

    if (
      blockAbove &&
      [codeBlockType, codeLineType].includes(blockAbove?.type)
    ) {
      return insertFragment(
        fragment.flatMap((node) => {
          const element = node as TElement;

          return element.type === codeBlockType
            ? extractCodeLinesFromCodeBlock(element)
            : convertNodeToCodeLine(element);
        })
      );
    }

    return insertFragment(fragment);
  };
};
