import {
  focusEditor,
  PlateEditor,
  TElement,
  Value,
} from '@udecode/plate-common';
import { isTableBorderHidden } from '../../queries/index';
import { setBorderSize } from '../../transforms/index';
import { BorderDirection } from '../../types';

export const getOnSelectTableBorderFactory =
  <V extends Value>(editor: PlateEditor<V>, selectedCells: TElement[] | null) =>
  (border: BorderDirection | 'outer' | 'none') =>
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
