import {
  ELEMENT_DEFAULT,
  getAboveNode,
  getNodeString,
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
import { Point } from 'slate';

import { isIndentElement } from '../queries';

export const deleteWhenEmpty = <V extends Value>(
  editor: PlateEditor<V>,
  pointBefore: Point
) => {
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
    select(editor, pointBefore);
    return true;
  }

  if (!getNodeString(aboveCell) && isIndentElement(aboveCell as TElement)) {
    outdent(editor);
    unsetNodes(editor, ['listStyleType', 'checked']);
    return true;
  }
};
