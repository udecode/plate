import type { TextInsertFragmentOptions } from 'slate/dist/interfaces/transforms/text';

import { Transforms } from 'slate';

import type { TEditor, Value } from '../editor/TEditor';
import type { EElementOrText } from '../element/TElement';

/** Insert a fragment at a specific location in the editor. */
export const insertFragment = <
  N extends EElementOrText<V>,
  V extends Value = Value,
>(
  editor: TEditor<V>,
  fragment: N[],
  options?: TextInsertFragmentOptions
) => {
  Transforms.insertFragment(editor as any, fragment, options);
};
