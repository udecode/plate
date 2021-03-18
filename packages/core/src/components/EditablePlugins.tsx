import * as React from 'react';
import { Editable, useEditor } from 'slate-react';
import { useSlatePlugins } from '../hooks/useSlatePlugins/useSlatePlugins';
import { UseEditablePropsOptions } from '../types/UseEditablePropsOptions';

/**
 * {@link Editable} with plugins support.
 */
export const EditablePlugins = (props: UseEditablePropsOptions) => {
  // const editor = useSlateP();
  // const id = editor.id as string | undefined;

  const { getEditableProps } = useSlatePlugins(props);

  // if (!editor) return null;

  return <Editable {...getEditableProps()} />;
};
