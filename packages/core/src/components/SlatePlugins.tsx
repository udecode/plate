import React from 'react';
import { Editable, Slate } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { useSlatePlugins } from '../hooks/useSlatePlugins/useSlatePlugins';
import { SlateProps } from '../types/SlateProps';
import { SPEditor } from '../types/SPEditor';
import { UseSlatePluginsEffectsOptions } from '../types/UseSlatePluginsEffectsOptions';
import { UseSlatePropsOptions } from '../types/UseSlatePropsOptions';

export interface SlatePluginsProps<T extends SPEditor = SPEditor>
  extends UseSlatePluginsEffectsOptions<T>,
    UseSlatePropsOptions {
  children?: React.ReactNode;
  editableProps?: EditableProps;
}

export const SlatePlugins = <T extends SPEditor = SPEditor>({ children, ...options }: SlatePluginsProps<T>) => {
  const { slateProps, editableProps } = useSlatePlugins(options);

  if (!slateProps.editor) return null;

  return (
    <Slate {...(slateProps as SlateProps)}>
      {children}
      <Editable {...editableProps} />
    </Slate>
  );
};
