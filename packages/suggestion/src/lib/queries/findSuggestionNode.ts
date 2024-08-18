import {
  type FindNodeOptions,
  type SlateEditor,
  findNode,
} from '@udecode/plate-common';

import type { TSuggestionText } from '../types';

import { SuggestionPlugin } from '../SuggestionPlugin';

export const findSuggestionNode = <E extends SlateEditor>(
  editor: E,
  { match, ...options }: FindNodeOptions<E> = {}
) =>
  findNode<TSuggestionText>(editor, {
    match: (n, p) =>
      n[SuggestionPlugin.key] && (!match || (match as any)(n, p)),
    ...options,
  });
