import type { BaseEditor } from '@platejs/core';
import { type EditorNodesOptions, type Node, NodeApi } from '@platejs/plite';
import type { TSuggestionText } from '@platejs/utils';

import { getSuggestionKey } from './getSuggestionKeys';

export const getSuggestionNodeEntries = <E extends BaseEditor>(
  editor: E,
  suggestionId: string,
  { at = [], ...options }: EditorNodesOptions<Node> = {}
) =>
  editor.read.nodes.toArray<TSuggestionText>({
    at,
    ...options,
    match: (node, path) =>
      !!(node as Record<string, unknown>)[getSuggestionKey(suggestionId)] &&
      (!options.match || NodeApi.matches(node, options.match, path)),
  });
