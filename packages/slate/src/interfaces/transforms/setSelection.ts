import { Range, Transforms } from 'slate';

import { TEditor, Value } from '../editor/TEditor';

/**
 * Set new properties on the selection.
 */
export const setSelection = <V extends Value>(
  editor: TEditor<V>,
  props: Partial<Range>
) => {
  Transforms.setSelection(editor as any, props);
};
