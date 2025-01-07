import {
  type NodeProps,
  type SetNodesOptions,
  type SlateEditor,
  ElementApi,
  getAt,
  nanoid,
} from '@udecode/plate';

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

  if (!at) return;

  const { suggestionId = nanoid() } = options ?? {};

  // TODO: get all inline nodes to be set
  const _nodeEntries = editor.api.nodes({
    match: (n) => ElementApi.isElement(n) && editor.isInline(n),
    ...options,
  });
  const nodeEntries = [..._nodeEntries];

  editor.tf.withoutNormalizing(() => {
    const props: NodeProps<TSuggestionText> = getSuggestionProps(
      editor,
      suggestionId,
      options
    );

    editor.tf.setNodes(props, {
      at,
      marks: true,
    });

    nodeEntries.forEach(([, path]) => {
      editor.tf.setNodes<TSuggestionText>(props, {
        at: path,
        match: (n) => ElementApi.isElement(n) && editor.isInline(n),
        ...options,
      });
    });
  });
};
