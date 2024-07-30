import type { PlateEditor, TElement } from '@udecode/plate-common/server';

import { focusEditor } from '@udecode/plate-common';

import type { BorderDirection } from '../../types';

import { isTableBorderHidden } from '../../queries/index';
import { setBorderSize } from '../../transforms/index';

export const getOnSelectTableBorderFactory =
  (editor: PlateEditor, selectedCells: TElement[] | null) =>
  (border: 'none' | 'outer' | BorderDirection) =>
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
      focusEditor(editor);
    }, 50);
  };
