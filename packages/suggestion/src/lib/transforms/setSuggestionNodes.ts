import {
  type SetNodesOptions,
  type SlateEditor,
  type TNodeProps,
  addRangeMarks,
  getAt,
  isElement,
  nanoid,
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
  const _nodeEntries = editor.api.nodes({
    match: (n) => isElement(n) && editor.api.isInline(n),
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
      editor.tf.setNodes<TSuggestionText>(props, {
        at: path,
        match: (n) => isElement(n) && editor.api.isInline(n),
        ...options,
      });
    });
  });
};
