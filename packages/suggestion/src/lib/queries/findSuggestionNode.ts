import type { EditorFindOptions, SlateEditor, ValueOf } from '@udecode/plate';

import type { TSuggestionText } from '../types';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';

export const findSuggestionNode = <E extends SlateEditor>(
  editor: E,
  { match, ...options }: EditorFindOptions<ValueOf<E>> = {}
) =>
  editor.api.find<TSuggestionText>({
    match: (n, p) =>
      n[BaseSuggestionPlugin.key] && (!match || (match as any)(n, p)),
    ...options,
  });
