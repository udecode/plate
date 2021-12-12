import React from 'react';
import { Editable } from 'slate-react';
import { usePlate } from '../hooks/usePlate/usePlate';
import { PlateProps } from './Plate';

/**
 * {@link Editable} with plugins support.
 */
export const EditablePlugins = (props: Pick<PlateProps, 'id'>) => {
  const { editableProps } = usePlate(props);

  return <Editable {...editableProps} />;
};
