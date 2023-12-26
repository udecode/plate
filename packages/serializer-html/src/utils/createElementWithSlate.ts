import React from 'react';
import { createPlateEditor, Plate, PlateProps } from '@udecode/plate-common';

/**
 * Create a React element wrapped in a Plate provider.
 */
export const createElementWithSlate = (
  plateProps?: Partial<PlateProps>,
  dndWrapper?: string | React.FC | React.ComponentClass
) => {
  const {
    editor = createPlateEditor(),
    value = [],
    onChange = () => {},
    children,
    ...props
  } = plateProps || {};

  const plate = React.createElement(
    Plate,
    {
      editor,
      initialValue: value,
      onChange,
      ...props,
    } as PlateProps,
    children
  );

  if (dndWrapper) {
    return React.createElement(dndWrapper, null, plate);
  }

  return plate;
};
