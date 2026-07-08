import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateTransaction,
  Element,
  NodeProps,
  NodeSetNodesOptions,
  Text,
} from '@platejs/plite';

import { TextApi } from '@platejs/plite';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const setBlockSelectionNodes = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  props: Partial<NodeProps<Element>>,
  options?: NodeSetNodesOptions
) => {
  const { api } = editor.plugin(BlockSelectionPlugin);
  const blocks = api.blockSelection.getNodes();

  blocks.forEach(([, path]) => {
    tx.nodes.set(props, {
      ...options,
      at: path,
    });
  });
};

export const setBlockSelectionIndent = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  indent: number,
  options?: NodeSetNodesOptions
) => {
  const { api } = editor.plugin(BlockSelectionPlugin);
  const blocks = api.blockSelection.getNodes();

  blocks.forEach(([node, path]) => {
    const prevIndent = (node as { indent?: number }).indent ?? 0;
    const currentIndent = prevIndent + indent;

    tx.nodes.set(
      { indent: Math.max(currentIndent, 0) },
      {
        ...options,
        at: path,
      }
    );
  });
};

export const setBlockSelectionTexts = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  props: Partial<NodeProps<Text>>,
  options?: Omit<NodeSetNodesOptions, 'at'>
) => {
  const { api } = editor.plugin(BlockSelectionPlugin);
  const blocks = api.blockSelection.getNodes();

  blocks.forEach(([, path]) => {
    tx.nodes.set(props, {
      mode: 'all',
      ...options,
      at: path,
      match: TextApi.isText,
    });
  });
};
