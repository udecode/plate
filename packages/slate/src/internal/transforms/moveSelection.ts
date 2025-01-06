import type { SelectionMoveOptions } from 'slate/dist/interfaces/transforms/selection';

import { move } from 'slate';

import type { Editor } from '../../interfaces';

export const moveSelection = (
  editor: Editor,
  options?: SelectionMoveOptions
) => {
  move(editor as any, options);
};
