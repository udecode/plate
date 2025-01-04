import type {
  FindNodeOptions,
  SlateEditor,
  ValueOf,
} from '@udecode/plate-common';

import type { TSuggestionText } from '../types';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';

export const findSuggestionNode = <E extends SlateEditor>(
  editor: E,
  { match, ...options }: FindNodeOptions<ValueOf<E>> = {}
) =>
  editor.api.find<TSuggestionText>({
    match: (n, p) =>
      n[BaseSuggestionPlugin.key] && (!match || (match as any)(n, p)),
    ...options,
  });
