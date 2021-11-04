import { getParent } from '@udecode/plate-common';
import {
  getPlatePluginType,
  PlateEditor,
  TElement,
  TPlateEditor,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { ELEMENT_LI } from '../defaults';

/**
 * Is the list nested, i.e. its parent is a list item.
 */
export const isListNested = (editor: PlateEditor, listPath: Path) => {
  const listParentNode = getParent<TElement>(editor, listPath)?.[0];

  return listParentNode?.type === getPlatePluginType(editor, ELEMENT_LI);
};
