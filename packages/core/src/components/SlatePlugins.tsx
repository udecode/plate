import React from 'react';
import { Editable, Slate } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { useSlatePlugins } from '../hooks/useSlatePlugins/useSlatePlugins';
import { SlateProps } from '../types/SlateProps';
import { UseSlatePluginsEffectsOptions } from '../types/UseSlatePluginsEffectsOptions';
import { UseSlatePropsOptions } from '../types/UseSlatePropsOptions';

export interface SlatePluginsProps
  extends UseSlatePluginsEffectsOptions,
    UseSlatePropsOptions {
  children?: React.ReactNode;
  editableProps?: EditableProps;
}

export const SlatePlugins = ({ children, ...options }: SlatePluginsProps) => {
  const { slateProps, editableProps } = useSlatePlugins(options);

  if (!slateProps.editor) return null;

  return (
    <Slate {...(slateProps as SlateProps)}>
      {children}
      <Editable {...editableProps} />
    </Slate>
  );
};
