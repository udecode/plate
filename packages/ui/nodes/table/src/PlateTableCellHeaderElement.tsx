import React from 'react';
import {
  PlateTableCellElement,
  PlateTableCellElementProps,
} from './PlateTableCellElement';

export const PlateTableCellHeaderElement = (
  props: PlateTableCellElementProps
) => {
  return <PlateTableCellElement {...props} isHeader />;
};
