import {
  type EditorNodesOptions,
  type SlateEditor,
  type TSuggestionText,
  type ValueOf,
  combineMatchOptions,
} from '@udecode/plate';

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
      (n) => n.suggestionId === suggestionId,
      options
    ),
  });
