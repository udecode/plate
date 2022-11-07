import {
  getEndPoint,
  moveSelection,
  PlateEditor,
  select,
} from '@udecode/plate-core';
import { isDocumentEnd } from '../queries';

export const changeSelectionToBeBasedOnTheNextNode = (editor: PlateEditor) => {
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
