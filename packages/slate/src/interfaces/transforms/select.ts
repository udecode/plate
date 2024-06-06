import { type Location, Transforms } from 'slate';

import type { TEditor, Value } from '../editor/TEditor';

/** Set the selection to a new value. */
export const select = <V extends Value>(
  editor: TEditor<V>,
  target: Location
) => {
  Transforms.select(editor as any, target);
};
