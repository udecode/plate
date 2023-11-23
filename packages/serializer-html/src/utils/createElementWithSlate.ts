import React, { ComponentClass, FunctionComponent } from 'react';
import { Plate, PlateProps } from '@udecode/plate-common';

/**
 * Create a React element wrapped in a Plate provider.
 */
export const createElementWithSlate = (
  plateProps?: Partial<PlateProps>,
  dndWrapper?: string | FunctionComponent | ComponentClass
) => {
  const {
    editor,
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
