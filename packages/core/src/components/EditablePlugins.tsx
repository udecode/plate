import { useEffect } from 'react';
import * as React from 'react';
import { Editable } from 'slate-react';
import { useSlatePlugins } from '../hooks/useSlatePlugins/useSlatePlugins';
import { useSlatePluginsEditor } from '../store/useSlatePluginsEditor';
import { UseEditableOptions } from '../types/UseEditableOptions';

/**
 * {@link Editable} with plugins support.
 */
export const EditablePlugins = (props: UseEditableOptions) => {
  const { id } = props;

  useEffect(() => {
    console.log(props);
  }, [props]);

  const { getEditableProps } = useSlatePlugins(props);

  const editor = useSlatePluginsEditor(id);

  if (!editor) return null;

  return <Editable {...getEditableProps()} />;
};
