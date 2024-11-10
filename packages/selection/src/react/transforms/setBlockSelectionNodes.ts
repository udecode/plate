import type { PlateEditor } from '@udecode/plate-common/react';

import {
  type SetNodesOptions,
  type TElement,
  type TNodeProps,
  type TText,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const setBlockSelectionNodes = (
  editor: PlateEditor,
  props: Partial<TNodeProps<TElement>>,
  options?: SetNodesOptions
) => {
  withoutNormalizing(editor, () => {
    const blocks = editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.getNodes();

    blocks.forEach(([, path]) => {
      setNodes<TElement & { id: string }>(editor, props, {
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

  withoutNormalizing(editor, () => {
    const blocks = api.blockSelection.getNodes();

    blocks.forEach(([node, path]) => {
      const prevIndent = (node as any).indent ?? 0;

      const currentIndent = prevIndent + indent;

      setNodes<TElement & { id: string }>(
        editor,
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
