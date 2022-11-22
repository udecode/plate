import {
  getEndPoint,
  moveSelection,
  PlateEditor,
  select,
  Value,
} from '@udecode/plate-core';
import { isDocumentEnd } from '../queries';

export const rebaseSelectionFromNextNode = <V extends Value = Value>(
  editor: PlateEditor<V>
) => {
  if (isDocumentEnd(editor)) {
    const endPoint = getEndPoint(editor, []);
    select(editor, endPoint);
  } else {
    moveSelection(editor, {
      distance: 1,
      unit: 'character',
    });
    moveSelection(editor, {
      distance: 1,
      unit: 'character',
      reverse: true,
    });
  }
};
