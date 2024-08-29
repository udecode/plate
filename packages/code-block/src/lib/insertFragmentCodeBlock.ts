import {
  type SlateEditor,
  type TDescendant,
  type TElement,
  getBlockAbove,
  getNodeString,
} from '@udecode/plate-common';

import { CodeBlockPlugin, CodeLinePlugin } from './CodeBlockPlugin';

function extractCodeLinesFromCodeBlock(node: TElement) {
  return node.children as TElement[];
}

export const insertFragmentCodeBlock = (editor: SlateEditor) => {
  const { insertFragment } = editor;
  const codeBlockType = editor.getType(CodeBlockPlugin);
  const codeLineType = editor.getType(CodeLinePlugin);

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
