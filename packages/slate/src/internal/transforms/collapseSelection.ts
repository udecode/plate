import type { SelectionCollapseOptions } from 'slate/dist/interfaces/transforms/selection';

import { collapse } from 'slate';

import type { TEditor } from '../../interfaces';

export const collapseSelection = (
  editor: TEditor,
  options?: SelectionCollapseOptions
) => {
  collapse(editor as any, options);
};
