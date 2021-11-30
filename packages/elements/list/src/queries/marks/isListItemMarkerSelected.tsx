import { MutableRefObject } from 'react';
import { getAbove } from '@udecode/plate-common';
import { getPlatePluginType, PlateEditor } from '@udecode/plate-core';
import { isEqual } from 'lodash';
import { NodeEntry } from 'slate';
import { ReactEditor } from 'slate-react';
import { ELEMENT_LIC } from '../../defaults';
import { ListItemMarkerSelection } from '../../types';
import { getListRoot } from '../getListRoot';
import { getListItemDepth } from './getListItemDepth';

export const isListItemMarkerSelected = (
  editor: PlateEditor & ReactEditor,
  ref: MutableRefObject<HTMLElement>,
  listItemSelection?: ListItemMarkerSelection
): boolean => {
  if (!editor || !listItemSelection || !ref) {
    return false;
  }
  const licType = getPlatePluginType(editor, ELEMENT_LIC);

  const point = ReactEditor.toSlatePoint(editor, [ref.current, 0], {
    exactMatch: false,
    suppressThrow: true,
  });

  if (!point) {
    return false;
  }

  try {
    const lic = getAbove(editor, {
      at: point,
      match: { type: licType },
    }) as NodeEntry;

    if (isEqual(listItemSelection.path, lic[1])) {
      return true;
    }

    if (listItemSelection.depth) {
      const licDepth = getListItemDepth(lic[1]);
      const selectionDepth = getListItemDepth(listItemSelection.path);
      if (licDepth === selectionDepth) {
        const licRoot = getListRoot(editor, lic[1]);
        const selectionRoot = getListRoot(editor, listItemSelection.path);
        if (selectionRoot && licRoot && isEqual(selectionRoot[1], licRoot[1])) {
          return true;
        }
      }
    }

    return false;
  } catch (e) {
    return false;
  }
};
