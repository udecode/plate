import {
  EElement,
  getBlockAbove,
  getNodeString,
  getPluginType,
  PlateEditor,
  TDescendant,
  TElement,
  Value,
} from '@udecode/plate-common';

import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from './constants';

function extractCodeLinesFromCodeBlock(node: TElement) {
  return node.children as TElement[];
}

export const insertFragmentCodeBlock = <V extends Value>(
  editor: PlateEditor<V>
) => {
  const { insertFragment } = editor;
  const codeBlockType = getPluginType(editor, ELEMENT_CODE_BLOCK);
  const codeLineType = getPluginType(editor, ELEMENT_CODE_LINE);

  function convertNodeToCodeLine(node: TElement): TElement {
    return {
      type: codeLineType,
      children: [{ text: getNodeString(node) }],
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

          return (
            element.type === codeBlockType
              ? extractCodeLinesFromCodeBlock(element)
              : convertNodeToCodeLine(element)
          ) as EElement<V>;
        })
      );
    }

    return insertFragment(fragment);
  };
};
