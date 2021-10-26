import React from 'react';
import { Editable } from 'slate-react';
import { usePlate } from '../hooks/usePlate/usePlate';
import { UseEditablePropsOptions } from '../types/UseEditablePropsOptions';

/**
 * {@link Editable} with plugins support.
 */
export const EditablePlugins = (props: UseEditablePropsOptions) => {
  const { editableProps } = usePlate(props);

  return <Editable {...editableProps} />;
};
