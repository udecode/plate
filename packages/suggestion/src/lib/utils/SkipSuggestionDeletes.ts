import {
  type Node,
  type SlateEditor,
  type TSuggestionText,
  KEYS,
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
  if (TextApi.isText(node)) {
    if (!node[KEYS.suggestion]) return node.text;

    const suggestionData = editor
      .getApi(BaseSuggestionPlugin)
      .suggestion.suggestionData(node as TSuggestionText);

    if (suggestionData?.type === 'remove') return '';

    return node.text;
  } else {
    return node.children
      .map((child) => SkipSuggestionDeletes(editor, child))
      .join('');
  }
};
