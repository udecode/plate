import type { EditorNodesOptions , SlateEditor, TElement, ValueOf } from "@udecode/plate";

import type { TSuggestionText } from "../types";

import { BaseSuggestionPlugin, SUGGESTION_KEYS } from "../BaseSuggestionPlugin";

export const getAllSuggestionNodes = <E extends SlateEditor>(
  editor: E,
  { at = [], ...options }: EditorNodesOptions<ValueOf<E>> = {}
) =>
  editor.api.nodes<TElement | TSuggestionText>({
    at,
    mode: 'all',
    match: (n) => n[BaseSuggestionPlugin.key] || n[SUGGESTION_KEYS.lineBreak],
    ...options,
  });
