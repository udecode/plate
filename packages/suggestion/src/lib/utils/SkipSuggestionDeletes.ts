import {
  type Node,
  type SlateEditor,
  type TSuggestionText,
  ElementApi,
  KEYS,
  NodeApi,
  TextApi,
} from 'platejs';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';

/**
 * Recursively extracts text content from a node tree, excluding any text marked
 * with "remove" suggestions. but include the text marked with "insert" and
 * "update" suggestions.
 */
export const SkipSuggestionDeletes = (
  editor: SlateEditor,
  node: Node
): string => {
  if (
    TextApi.isText(node) ||
    (ElementApi.isElement(node) && editor.api.isInline(node))
  ) {
    if (ElementApi.isElement(node)) {
      return NodeApi.string(node);
    }
    if (!node[KEYS.suggestion]) return node.text;

    const suggestionData = editor
      .getApi(BaseSuggestionPlugin)
      .suggestion.suggestionData(node as TSuggestionText);

    if (suggestionData?.type === 'remove') return '';

    return node.text;
  }
  return node.children
    .map((child) => SkipSuggestionDeletes(editor, child))
    .join('');
};
