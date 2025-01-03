import type { Modify } from '@udecode/utils';
import type { TextInsertFragmentOptions } from 'slate/dist/interfaces/transforms/text';

import { insertFragment as insertFragmentBase } from 'slate';

import type { ElementOrTextOf, TEditor } from '../../interfaces';
import type { QueryAt, QueryVoids } from '../../types';

import { getAt } from '../../utils/getAt';

export type InsertFragmentOptions = Modify<
  TextInsertFragmentOptions,
  QueryAt & QueryVoids
>;

export const insertFragment = <
  N extends ElementOrTextOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  fragment: N[],
  options?: InsertFragmentOptions
) => {
  insertFragmentBase(editor as any, fragment, {
    ...options,
    at: getAt(editor, options?.at),
  });
};
