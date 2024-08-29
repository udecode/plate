import type { TextInsertFragmentOptions } from 'slate/dist/interfaces/transforms/text';

import { Transforms } from 'slate';

import type { TEditor } from '../editor/TEditor';
import type { ElementOrTextOf } from '../element/TElement';

/** Insert a fragment at a specific location in the editor. */
export const insertFragment = <
  N extends ElementOrTextOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  fragment: N[],
  options?: TextInsertFragmentOptions
) => {
  Transforms.insertFragment(editor as any, fragment, options);
};
