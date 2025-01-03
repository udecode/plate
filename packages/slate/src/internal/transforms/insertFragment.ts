import { insertFragment as insertFragmentBase } from 'slate';

import type { ElementOrTextOf, TEditor } from '../../interfaces';
import type { InsertFragmentOptions } from '../../interfaces/editor/editor-types';

import { getAt } from '../../utils/getAt';

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
