import {
  ELEMENT_DEFAULT,
  getAboveNode,
  getNodeString,
  getPointBefore,
  getPreviousNode,
  isDefined,
  isElement,
  PlateEditor,
  removeNodes,
  select,
  TElement,
  unsetNodes,
  Value,
} from '@udecode/plate-common';
import { outdent } from '@udecode/plate-indent';
import Slate, { TextUnit, TextUnitAdjustment } from 'slate';

import { isIndentElement } from '../queries';

export const deleteBackwardIndentList = <V extends Value>(
  editor: PlateEditor<V>
) => {
  const { deleteBackward } = editor;

  return function (unit: TextUnit) {
    // don't delete the indent list element when just a bullets numbering or checkbox should be turn to default paragraph
    if (!deleteWhenEmpty(editor, unit)) {
      return deleteBackward(unit);
    }
  };
};

const deleteWhenEmpty = <V extends Value>(
  editor: PlateEditor<V>,
  unit: TextUnitAdjustment
) => {
  const pointBefore = getPointBefore(
    editor,
    editor.selection as Slate.Location,
    {
      unit,
    }
  );
  const aboveEntry = getAboveNode(editor, {
    match: (n) => isElement(n) && n.type === ELEMENT_DEFAULT,
  });

  const prevEntry = getPreviousNode(editor, {
    match: (n) => n.type === ELEMENT_DEFAULT || n.type === 'blockquote',
  });

  if (!prevEntry || !aboveEntry) return;

  const [prevCell] = prevEntry;
  const [aboveCell] = aboveEntry;

  if (!getNodeString(prevCell) && !isDefined(aboveCell.listStyleType)) {
    removeNodes(editor);
    select(editor, pointBefore!);
    return true;
  }

  if (!getNodeString(aboveCell) && isIndentElement(aboveCell as TElement)) {
    outdent(editor);
    unsetNodes(editor, ['listStyleType', 'checked']);
    return true;
  }
};
