import type { SelectionCollapseOptions } from 'slate/dist/interfaces/transforms/selection';

import { Transforms } from 'slate';

import type { TEditor } from '../editor/TEditor';

/** Collapse the selection. */
export const collapseSelection = (
  editor: TEditor,
  options?: SelectionCollapseOptions
) => {
  Transforms.collapse(editor as any, options);
};
