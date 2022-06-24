import React from 'react';
import { Editable } from 'slate-react';
import { usePlate } from '../../hooks/plate/usePlate';
import { Value } from '../../slate/editor/TEditor';
import { PlateProps } from './Plate';

/**
 * {@link Editable} with plugins support.
 */
export const EditablePlugins = <V extends Value>(
  props: Pick<PlateProps<V>, 'id'>
) => {
  const { editableProps } = usePlate(props);

  return <Editable {...(editableProps as any)} />;
};
