import type { Modify } from '@udecode/utils';

import { type EditorPositionsOptions, positions } from 'slate';

import type { QueryAt, QueryTextUnit, QueryVoids } from '../../types';
import type { TEditor } from './TEditor';

import { getAt } from '../../utils';

export type GetPositionsOptions = Modify<
  EditorPositionsOptions,
  QueryAt &
    QueryVoids &
    QueryTextUnit & {
      ignoreNonSelectable?: boolean;
      /**
       * When `true` returns the positions in reverse order. In the case of the
       * `unit` being `word`, the actual returned positions are different (i.e.
       * we will get the start of a word in reverse instead of the end).
       */
      reverse?: boolean;
    }
>;

export const getPositions = (
  editor: TEditor,
  options?: Modify<EditorPositionsOptions, QueryAt>
) =>
  positions(editor as any, {
    ...options,
    at: getAt(editor, options?.at),
  });
