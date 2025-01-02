import {
  type SetNodesOptions,
  type SlateEditor,
  type TNodeProps,
  addRangeMarks,
  getAt,
  getNodeEntries,
  isInline,
  nanoid,
  setNodes,
} from '@udecode/plate-common';

import type { TSuggestionText } from '../types';

import { getSuggestionProps } from './getSuggestionProps';

export const setSuggestionNodes = (
  editor: SlateEditor,
  options?: {
    suggestionDeletion?: boolean;
    suggestionId?: string;
  } & SetNodesOptions
) => {
  const at = getAt(editor, options?.at) ?? editor.selection;
  const { suggestionId = nanoid() } = options ?? {};

  // TODO: get all inline nodes to be set
  const _nodeEntries = getNodeEntries(editor, {
    match: (n) => isInline(editor, n),
    ...options,
  });
  const nodeEntries = [..._nodeEntries];

  editor.tf.withoutNormalizing(() => {
    const props: TNodeProps<TSuggestionText> = getSuggestionProps(
      editor,
      suggestionId,
      options
    );

    addRangeMarks(editor, props, {
      at,
    });

    nodeEntries.forEach(([, path]) => {
      setNodes<TSuggestionText>(editor, props, {
        at: path,
        match: (n) => {
          if (!isInline(editor, n)) return false;

          return true;
        },
        ...options,
      });
    });
  });
};
