import { MutableRefObject } from 'react';
import { getAbove } from '@udecode/plate-common';
import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import { ELEMENT_LIC, getListRoot } from '@udecode/plate-list';
import { isEqual } from 'lodash';
import { ReactEditor } from 'slate-react';
import { LicSelection } from '../atoms/licSelection';
import { getLevel } from './getLevel';

export const isSelected = (
  editor: SPEditor & ReactEditor,
  ref: MutableRefObject<HTMLElement>,
  licSelection?: LicSelection
): boolean => {
  if (!editor || !licSelection || !ref) {
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

  const lic = getAbove(editor, {
    at: point,
    match: { type: licType },
  });
  if (!lic) {
    return false;
  }

  if (isEqual(licSelection.path, lic[1])) {
    return true;
  }

  if (licSelection.level) {
    const licLevel = getLevel(lic[1]);
    const selectionLevel = getLevel(licSelection.path);
    if (licLevel === selectionLevel) {
      const licRoot = getListRoot(editor, lic[1]);
      const selectionRoot = getListRoot(editor, licSelection.path);
      if (selectionRoot && licRoot && isEqual(selectionRoot[1], licRoot[1])) {
        return true;
      }
    }
  }

  return false;
};
