import type { SlateEditor, TElement } from '@udecode/plate-common';

import {
  type BorderDirection,
  isTableBorderHidden,
  setBorderSize,
} from '../../../lib';

export const getOnSelectTableBorderFactory =
  (editor: SlateEditor, selectedCells: TElement[] | null) =>
  (border: BorderDirection | 'none' | 'outer') =>
  () => {
    if (selectedCells) return;
    if (border === 'none') {
      setBorderSize(editor, 0, { border: 'all' });
    } else if (border === 'outer') {
      setBorderSize(editor, 1, { border: 'all' });
    } else {
      const size = isTableBorderHidden(editor, border) ? 1 : 0;

      setBorderSize(editor, size, { border });
    }

    setTimeout(() => {
      editor.focus();
    }, 50);
  };
