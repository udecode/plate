import {
  type GetNodeEntriesOptions,
  type SlateEditor,
  type ValueOf,
  getNodeEntries,
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
  } & GetNodeEntriesOptions<ValueOf<E>> = {}
) =>
  getNodeEntries<TSuggestionText>(editor, {
    at,
    match: (n) =>
      n.suggestionId === suggestionId && match(n as TSuggestionText),
    ...options,
  });
