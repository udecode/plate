import type { SelectionMoveOptions } from 'slate/dist/interfaces/transforms/selection';

import { Transforms } from 'slate';

import type { TEditor, Value } from '../editor/TEditor';

/** Move the selection's point forward or backward. */
export const moveSelection = <V extends Value>(
  editor: TEditor<V>,
  options?: SelectionMoveOptions
) => {
  Transforms.move(editor as any, options);
};
