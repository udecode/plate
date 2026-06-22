import type { Element } from '@platejs/slate';

import { type OverrideEditor, KEYS, NodeApi } from 'platejs';

function extractCodeLinesFromCodeBlock(node: Element) {
  return node.children as Element[];
}

export const withInsertFragmentCodeBlock: OverrideEditor = ({
  editor,
  tf: { insertFragment },
  type: codeBlockType,
}) => ({
  transforms: {
    insertFragment(fragment) {
      const [blockAbove] = editor.api.block<Element>() ?? [];
      const codeLineType = editor.getType(KEYS.codeLine);

      function convertNodeToCodeLine(node: Element): Element {
        return {
          children: [{ text: NodeApi.string(node) }],
          type: codeLineType,
        };
      }

      if (
        blockAbove &&
        [codeBlockType, codeLineType].includes(blockAbove?.type)
      ) {
        return insertFragment(
          fragment.flatMap((node) => {
            const element = node as Element;

            return element.type === codeBlockType
              ? extractCodeLinesFromCodeBlock(element)
              : convertNodeToCodeLine(element);
          })
        );
      }

      return insertFragment(fragment);
    },
  },
});
