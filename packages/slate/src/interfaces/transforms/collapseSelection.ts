import type { SelectionCollapseOptions } from 'slate/dist/interfaces/transforms/selection';

import { Transforms } from 'slate';

import type { TEditor, Value } from '../editor/TEditor';

/** Collapse the selection. */
export const collapseSelection = <V extends Value>(
  editor: TEditor<V>,
  options?: SelectionCollapseOptions
) => {
  Transforms.collapse(editor as any, options);
};
