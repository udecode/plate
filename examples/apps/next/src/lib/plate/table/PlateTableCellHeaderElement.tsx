import React from 'react';
import {
  PlateTableCellElement,
  PlateTableCellElementProps,
} from './PlateTableCellElement';

export function PlateTableCellHeaderElement(props: PlateTableCellElementProps) {
  return <PlateTableCellElement {...props} isHeader />;
}
