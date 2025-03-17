import type {
  NodeProps,
  SetNodesOptions,
  TElement,
  TText,
} from '@udecode/plate';
import type { PlateEditor } from '@udecode/plate/react';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const setBlockSelectionNodes = (
  editor: PlateEditor,
  props: Partial<NodeProps<TElement>>,
  options?: SetNodesOptions
) => {
  editor.tf.withoutNormalizing(() => {
    const blocks = editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.getNodes();

    blocks.forEach(([, path]) => {
      editor.tf.setNodes(props, {
        ...options,
        at: path,
      });
    });
  });
};

export const setBlockSelectionIndent = (
  editor: PlateEditor,
  indent: number,
  options?: SetNodesOptions
) => {
  const api = editor.getApi(BlockSelectionPlugin);

  editor.tf.withoutNormalizing(() => {
    const blocks = api.blockSelection.getNodes();

    blocks.forEach(([node, path]) => {
      const prevIndent = (node as any).indent ?? 0;

      const currentIndent = prevIndent + indent;

      editor.tf.setNodes(
        { indent: Math.max(currentIndent, 0) },
        {
          ...options,
          at: path,
        }
      );
    });
  });
};

export const setBlockSelectionTexts = (
  editor: PlateEditor,
  props: Partial<NodeProps<TText>>,
  options?: Omit<SetNodesOptions, 'at'>
) => {
  setBlockSelectionNodes(editor, props, {
    mode: 'lowest',
    ...options,
  });
};
