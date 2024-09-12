import {
  type FindNodeOptions,
  type SlateEditor,
  findNode,
} from '@udecode/plate-common';

import type { TSuggestionText } from '../types';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';

export const findSuggestionNode = <E extends SlateEditor>(
  editor: E,
  { match, ...options }: FindNodeOptions<E> = {}
) =>
  findNode<TSuggestionText>(editor, {
    match: (n, p) =>
      n[BaseSuggestionPlugin.key] && (!match || (match as any)(n, p)),
    ...options,
  });
