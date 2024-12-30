import type { Modify } from '@udecode/utils';
import type { TextInsertFragmentOptions } from 'slate/dist/interfaces/transforms/text';

import { Transforms } from 'slate';

import type { QueryAt, QueryVoids } from '../../types';
import type { TEditor } from '../editor/TEditor';
import type { ElementOrTextOf } from '../element/TElement';

import { getAt } from '../../utils/getAt';

export const insertFragment = <
  N extends ElementOrTextOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  fragment: N[],
  options?: Modify<TextInsertFragmentOptions, QueryAt & QueryVoids>
) => {
  Transforms.insertFragment(editor as any, fragment, {
    ...options,
    at: getAt(editor, options?.at),
  });
};
