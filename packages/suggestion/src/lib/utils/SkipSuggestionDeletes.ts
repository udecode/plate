import type { BaseEditor } from '@platejs/core';
import { type Node, ElementApi, NodeApi, TextApi } from '@platejs/plite';
import { type TSuggestionText, KEYS } from '@platejs/utils';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';

/**
 * Recursively extracts text content from a node tree, excluding any text marked
 * with "remove" suggestions. but include the text marked with "insert" and
 * "update" suggestions.
 */
export const SkipSuggestionDeletes = (
  editor: BaseEditor,
  node: Node
): string => {
  if (
    TextApi.isText(node) ||
    (ElementApi.isElement(node) && editor.read.schema.isInline(node))
  ) {
    if (ElementApi.isElement(node)) {
      return NodeApi.string(node);
    }
    if (!node[KEYS.suggestion]) return node.text;

    const suggestionData = editor
      .plugin(BaseSuggestionPlugin)
      .api.suggestionData(node as TSuggestionText);

    if (suggestionData?.type === 'remove') return '';

    return node.text;
  }
  if (!ElementApi.isElement(node) && !NodeApi.isEditor(node)) {
    return '';
  }

  return Array.from(NodeApi.children(node, []))
    .map(([child]) => SkipSuggestionDeletes(editor, child))
    .join('');
};
