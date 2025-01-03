import type { SelectionMoveOptions } from 'slate/dist/interfaces/transforms/selection';

import { move } from 'slate';

import type { TEditor } from '../../interfaces';

export const moveSelection = (
  editor: TEditor,
  options?: SelectionMoveOptions
) => {
  move(editor as any, options);
};