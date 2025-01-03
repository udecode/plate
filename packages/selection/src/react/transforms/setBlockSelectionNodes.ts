import type {
  SetNodesOptions,
  TElement,
  TNodeProps,
  TText,
} from '@udecode/plate-common';
import type { PlateEditor } from '@udecode/plate-common/react';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const setBlockSelectionNodes = (
  editor: PlateEditor,
  props: Partial<TNodeProps<TElement>>,
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
        { indent: currentIndent < 0 ? 0 : currentIndent },
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
  props: Partial<TNodeProps<TText>>,
  options?: Omit<SetNodesOptions, 'at'>
) => {
  setBlockSelectionNodes(editor, props, {
    mode: 'lowest',
    ...options,
  });
};
