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
