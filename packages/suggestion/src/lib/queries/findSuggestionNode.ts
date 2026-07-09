import type { BaseEditor } from '@platejs/core';
import { type EditorNodesOptions, type Node, TextApi } from '@platejs/plite';
import { type TSuggestionText, KEYS } from '@platejs/utils';

export const findInlineSuggestionNode = <E extends BaseEditor>(
  editor: E,
  options: EditorNodesOptions<Node> = {}
) =>
  editor.read.nodes.find<TSuggestionText>({
    ...options,
    match: (node, path) =>
      TextApi.isText(node) &&
      !!node[KEYS.suggestion] &&
      (!options.match || options.match(node, path)),
  });
