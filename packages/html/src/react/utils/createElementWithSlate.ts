import React from 'react';

import {
  type PlateProps,
  Plate,
  PlateContent,
} from '@udecode/plate-common/react';

/** Create a React element wrapped in a Plate provider. */
export const createElementWithSlate = (
  plateProps?: Partial<PlateProps>,
  dndWrapper?: React.ComponentClass | React.FC | string
) => {
  const { children, editor, onChange = () => {}, ...props } = plateProps || {};

  const plateContent = React.createElement(PlateContent, {
    renderEditable: () => children,
  });

  const plate = React.createElement(
    Plate,
    {
      editor,
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
