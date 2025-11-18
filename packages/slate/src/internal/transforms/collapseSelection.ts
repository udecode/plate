import { collapse } from 'slate';
import type { SelectionCollapseOptions } from 'slate/dist/interfaces/transforms/selection';

import type { Editor } from '../../interfaces';

export const collapseSelection = (
  editor: Editor,
  options?: SelectionCollapseOptions
) => {
  collapse(editor as any, options);
};
