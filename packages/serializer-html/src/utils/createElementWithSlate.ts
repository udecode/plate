import React from 'react';

import { Plate, PlateContent, type PlateProps } from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/server';

/** Create a React element wrapped in a Plate provider. */
export const createElementWithSlate = (
  plateProps?: Partial<PlateProps>,
  dndWrapper?: React.ComponentClass | React.FC | string
) => {
  const {
    children,
    editor = createPlateEditor(),
    onChange = () => {},
    value = [],
    ...props
  } = plateProps || {};

  const plateContent = React.createElement(PlateContent, {
    renderEditable: () => children,
  });

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
