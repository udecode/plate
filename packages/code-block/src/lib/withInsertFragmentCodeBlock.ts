import { type OverrideEditor, type TElement, NodeApi } from '@udecode/plate';

export const withInsertFragmentCodeBlock: OverrideEditor = ({
  editor,
  tf: { insertFragment },
  type: codeBlockType,
}) => ({
  transforms: {
    insertFragment(fragment) {
      const [blockAbove] = editor.api.block<TElement>() ?? [];

      // If we're in a code block, convert all fragment nodes to text
      if (blockAbove && blockAbove?.type === codeBlockType) {
        // Extract text from all nodes in the fragment
        const text = fragment
          .map((node) => {
            const element = node as TElement;
            return NodeApi.string(element);
          })
          .join('\n');

        // Insert the text directly
        editor.tf.insertText(text);
        return;
      }

      return insertFragment(fragment);
    },
  },
});
