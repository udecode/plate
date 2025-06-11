import {
  type EditorNodesOptions,
  type SlateEditor,
  type TSuggestionText,
  type ValueOf,
  combineMatchOptions,
  KEYS,
  TextApi,
} from 'platejs';

export const findInlineSuggestionNode = <E extends SlateEditor>(
  editor: E,
  options: EditorNodesOptions<ValueOf<E>> = {}
) =>
  editor.api.node<TSuggestionText>({
    ...options,
    match: combineMatchOptions(
      editor,
      (n) => TextApi.isText(n) && (n as any)[KEYS.suggestion],
      options
    ),
  });
