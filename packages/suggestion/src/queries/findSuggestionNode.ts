import {
  findNode,
  FindNodeOptions,
  PlateEditor,
  Value,
} from '@udecode/plate-common';

import { MARK_SUGGESTION } from '../constants';
import { TSuggestionText } from '../types';

export const findSuggestionNode = <V extends Value>(
  editor: PlateEditor<V>,
  { match, ...options }: FindNodeOptions<V> = {}
) =>
  findNode<TSuggestionText>(editor, {
    match: (n, p) => n[MARK_SUGGESTION] && (!match || (match as any)(n, p)),
    ...options,
  });
