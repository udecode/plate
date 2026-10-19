import type { Editor, Range } from 'plitejs';

export const createRangeAnchor = (editor: Editor<any, any>, range: Range) =>
  editor.anchor(range, {
    association: 'inward',
    deletion: 'drop',
  });
