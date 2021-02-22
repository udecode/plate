import * as React from 'react';
import { Editable } from 'slate-react';
import { useEditableProps } from '../hooks/useSlatePlugins/useEditableProps';
import { UseEditableOptions } from '../types/UseEditableOptions';

/**
 * {@link Editable} with plugins support.
 */
export const EditablePlugins = (props: UseEditableOptions) => {
  const getEditableProps = useEditableProps(props);

  // TODO: remove
  // style={{
  //   fontSize: 16,
  //   lineHeight: 1.5,
  // }}
  return <Editable {...getEditableProps()} />;
};
