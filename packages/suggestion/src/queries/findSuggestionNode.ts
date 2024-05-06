import {
  type FindNodeOptions,
  type PlateEditor,
  type Value,
  findNode,
} from '@udecode/plate-common/server';

import type { TSuggestionText } from '../types';

import { MARK_SUGGESTION } from '../constants';

export const findSuggestionNode = <V extends Value>(
  editor: PlateEditor<V>,
  { match, ...options }: FindNodeOptions<V> = {}
) =>
  findNode<TSuggestionText>(editor, {
    match: (n, p) => n[MARK_SUGGESTION] && (!match || (match as any)(n, p)),
    ...options,
  });
