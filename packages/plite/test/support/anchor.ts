import type { Editor, Range } from '@platejs/plite';

export const createRangeAnchor = (editor: Editor, range: Range) =>
  editor.anchor(range, {
    association: 'inward',
    deletion: 'drop',
  });
