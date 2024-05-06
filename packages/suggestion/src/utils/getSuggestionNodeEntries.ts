import {
  type GetNodeEntriesOptions,
  type PlateEditor,
  type Value,
  getNodeEntries,
} from '@udecode/plate-common/server';

import type { TSuggestionText } from '../types';

export const getSuggestionNodeEntries = <V extends Value = Value>(
  editor: PlateEditor<V>,
  suggestionId: string,
  {
    at = [],
    match = () => true,
    ...options
  }: {
    match?: (suggestion: TSuggestionText) => boolean;
  } & GetNodeEntriesOptions<V> = {}
) =>
  getNodeEntries<TSuggestionText>(editor, {
    at,
    match: (n) =>
      n.suggestionId === suggestionId && match(n as TSuggestionText),
    ...options,
  });
