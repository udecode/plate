import {
  type EditorNodesOptions,
  type SlateEditor,
  type TSuggestionText,
  type ValueOf,
  combineMatchOptions,
} from 'platejs';

import { getSuggestionKey } from './getSuggestionKeys';

export const getSuggestionNodeEntries = <E extends SlateEditor>(
  editor: E,
  suggestionId: string,
  { at = [], ...options }: EditorNodesOptions<ValueOf<E>> = {}
) =>
  editor.api.nodes<TSuggestionText>({
    at,
    ...options,
    match: combineMatchOptions(
      editor,
      (n) => !!(n as any)[getSuggestionKey(suggestionId)],
      options
    ),
  });
