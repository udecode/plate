import * as React from 'react';
import { Editable, useEditor } from 'slate-react';
import { useSlatePlugins } from '../hooks/useSlatePlugins/useSlatePlugins';
import { UseEditablePropsOptions } from '../types/UseEditablePropsOptions';

/**
 * {@link Editable} with plugins support.
 */
export const EditablePlugins = (props: Omit<UseEditablePropsOptions, 'id'>) => {
  const editor = useEditor();
  const id = (editor.id as string) ?? 'main';

  const { getEditableProps } = useSlatePlugins({ ...props, id });

  if (!editor) return null;

  return <Editable {...getEditableProps()} />;
};
