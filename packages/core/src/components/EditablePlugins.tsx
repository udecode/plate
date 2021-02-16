import * as React from 'react';
import { Editable } from 'slate-react';
import { useEditablePlugins } from '../hooks/useEditablePlugins';
import { UseEditablePluginsOptions } from '../types/UseEditablePluginsOptions';

/**
 * {@link Editable} with plugins support.
 */
export const EditablePlugins = (props: UseEditablePluginsOptions) => {
  const getEditableProps = useEditablePlugins(props);

  // TODO: remove
  // style={{
  //   fontSize: 16,
  //   lineHeight: 1.5,
  // }}
  return <Editable {...getEditableProps()} />;
};
