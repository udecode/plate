import {
  type GetNodeEntriesOptions,
  type PlateEditor,
  getNodeEntries,
} from '@udecode/plate-common';

import type { TSuggestionText } from '../types';

export const getSuggestionNodeEntries = <E extends PlateEditor>(
  editor: E,
  suggestionId: string,
  {
    at = [],
    match = () => true,
    ...options
  }: {
    match?: (suggestion: TSuggestionText) => boolean;
  } & GetNodeEntriesOptions<E> = {}
) =>
  getNodeEntries<TSuggestionText>(editor, {
    at,
    match: (n) =>
      n.suggestionId === suggestionId && match(n as TSuggestionText),
    ...options,
  });
