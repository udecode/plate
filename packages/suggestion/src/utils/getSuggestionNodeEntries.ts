import {
  getNodeEntries,
  GetNodeEntriesOptions,
  PlateEditor,
  Value,
} from '@udecode/plate-common';
import { TSuggestionText } from '../types';

export const getSuggestionNodeEntries = <V extends Value = Value>(
  editor: PlateEditor<V>,
  suggestionId: string,
  {
    at = [],
    match = () => true,
    ...options
  }: GetNodeEntriesOptions<V> & {
    match?: (suggestion: TSuggestionText) => boolean;
  } = {}
) =>
  getNodeEntries<TSuggestionText>(editor, {
    at,
    match: (n) =>
      n.suggestionId === suggestionId && match(n as TSuggestionText),
    ...options,
  });
