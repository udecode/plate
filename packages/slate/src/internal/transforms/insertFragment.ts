import { insertFragment as insertFragmentBase } from 'slate';

import type {
  Editor,
  ElementOrTextOf,
  InsertFragmentOptions,
} from '../../interfaces';

import { getAt } from '../../utils/getAt';

export const insertFragment = <
  N extends ElementOrTextOf<E>,
  E extends Editor = Editor,
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
