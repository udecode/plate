import {
  type FindNodeOptions,
  type PlateEditor,
  findNode,
} from '@udecode/plate-common';

import type { TSuggestionText } from '../types';

import { MARK_SUGGESTION } from '../constants';

export const findSuggestionNode = <E extends PlateEditor>(
  editor: E,
  { match, ...options }: FindNodeOptions<E> = {}
) =>
  findNode<TSuggestionText>(editor, {
    match: (n, p) => n[MARK_SUGGESTION] && (!match || (match as any)(n, p)),
    ...options,
  });
