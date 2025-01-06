import type {
  EditorNodesOptions,
  SlateEditor,
  ValueOf,
} from '@udecode/plate-common';

import type { TSuggestionText } from '../types';

export const getSuggestionNodeEntries = <E extends SlateEditor>(
  editor: E,
  suggestionId: string,
  {
    at = [],
    match = () => true,
    ...options
  }: {
    match?: (suggestion: TSuggestionText) => boolean;
  } & EditorNodesOptions<ValueOf<E>> = {}
) =>
  editor.api.nodes<TSuggestionText>({
    at,
    match: (n) =>
      n.suggestionId === suggestionId && match(n as TSuggestionText),
    ...options,
  });
