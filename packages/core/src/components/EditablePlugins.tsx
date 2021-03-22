import * as React from 'react';
import { Editable } from 'slate-react';
import { useSlatePlugins } from '../hooks/useSlatePlugins/useSlatePlugins';
import { UseEditablePropsOptions } from '../types/UseEditablePropsOptions';

/**
 * {@link Editable} with plugins support.
 */
export const EditablePlugins = (props: UseEditablePropsOptions) => {
  const { getEditableProps } = useSlatePlugins(props);

  return <Editable {...getEditableProps()} />;
};
