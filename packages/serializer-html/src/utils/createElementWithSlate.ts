import React, { ComponentClass, FunctionComponent } from 'react';
import {
  createPlateEditor,
  Plate,
  PlateContent,
  PlateProps,
} from '@udecode/plate-common';

/**
 * Create a React element wrapped in a Plate provider.
 */
export const createElementWithSlate = (
  plateProps?: Partial<PlateProps>,
  dndWrapper?: string | FunctionComponent | ComponentClass
) => {
  const {
    editor = createPlateEditor(),
    value = [],
    onChange = () => {},
    children,
    ...props
  } = plateProps || {};

  const plateContent = React.createElement(PlateContent, children);

  const plate = React.createElement(
    Plate,
    {
      editor,
      initialValue: value,
      onChange,
      ...props,
    } as PlateProps,
    plateContent
  );

  if (dndWrapper) {
    return React.createElement(dndWrapper, null, plate);
  }

  return plate;
};
