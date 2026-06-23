import type {
  EditorUpdateTransaction,
  Element,
  NodeProps,
  Path,
  Text,
} from '@platejs/plite';
import { TextApi } from '@platejs/plite';
import type { PlateEditor } from 'platejs/react';

import type { BlockSelectionConfig } from '../BlockSelectionPlugin';

type TxSetNodesOptions = NonNullable<
  Parameters<EditorUpdateTransaction['nodes']['set']>[1]
>;

type BlockSelectionSetNodesOptions = Omit<TxSetNodesOptions, 'at'>;

const toTxSetNodesOptions = (
  options: BlockSelectionSetNodesOptions | undefined,
  at: Path
): TxSetNodesOptions => ({
  ...options,
  at,
});

export const setBlockSelectionNodes = (
  editor: PlateEditor,
  props: Partial<NodeProps<Element>>,
  options?: BlockSelectionSetNodesOptions
) => {
  const api = editor.api as unknown as BlockSelectionConfig['api'];

  editor.update((tx) => {
    const blocks = api.blockSelection.getNodes();

    blocks.forEach(([, path]) => {
      tx.nodes.set(props, toTxSetNodesOptions(options, path));
    });
  });
};

export const setBlockSelectionIndent = (
  editor: PlateEditor,
  indent: number,
  options?: BlockSelectionSetNodesOptions
) => {
  const api = editor.api as unknown as BlockSelectionConfig['api'];

  editor.update((tx) => {
    const blocks = api.blockSelection.getNodes();

    blocks.forEach(([node, path]) => {
      const prevIndent = (node as { indent?: number }).indent ?? 0;

      const currentIndent = prevIndent + indent;

      tx.nodes.set(
        { indent: Math.max(currentIndent, 0) },
        toTxSetNodesOptions(options, path)
      );
    });
  });
};

export const setBlockSelectionTexts = (
  editor: PlateEditor,
  props: Partial<NodeProps<Text>>,
  options?: BlockSelectionSetNodesOptions
) => {
  const api = editor.api as unknown as BlockSelectionConfig['api'];

  editor.update((tx) => {
    const blocks = api.blockSelection.getNodes();

    blocks.forEach(([, path]) => {
      tx.nodes.set<Text>(
        props,
        toTxSetNodesOptions(
          {
            mode: 'lowest',
            match: TextApi.isText,
            ...options,
          },
          path
        )
      );
    });
  });
};
