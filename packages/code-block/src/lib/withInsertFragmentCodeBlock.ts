import {
  type OverrideEditor,
  type TElement,
  KEYS,
  NodeApi,
} from '@udecode/plate';

function extractCodeLinesFromCodeBlock(node: TElement) {
  return node.children as TElement[];
}

export const withInsertFragmentCodeBlock: OverrideEditor = ({
  editor,
  tf: { insertFragment },
  type: codeBlockType,
}) => ({
  transforms: {
    insertFragment(fragment) {
      const [blockAbove] = editor.api.block<TElement>() ?? [];
      const codeLineType = editor.getType(KEYS.codeLine);

      function convertNodeToCodeLine(node: TElement): TElement {
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
            const element = node as TElement;

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
