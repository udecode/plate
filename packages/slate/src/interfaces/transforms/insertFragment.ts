import { Transforms } from 'slate';
import { TextInsertFragmentOptions } from 'slate/dist/interfaces/transforms/text';

import { TEditor, Value } from '../editor/TEditor';
import { EElementOrText } from '../element/TElement';

/**
 * Insert a fragment at a specific location in the editor.
 */
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
