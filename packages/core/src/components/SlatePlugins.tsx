import React from 'react';
import { Slate } from 'slate-react';
import { useSlatePlugins } from '../hooks/useSlatePlugins/useSlatePlugins';
import { SlateProps } from '../types/SlateProps';
import { UseSlatePluginsEffectsOptions } from '../types/UseSlatePluginsEffectsOptions';
import { UseSlatePropsOptions } from '../types/UseSlatePropsOptions';

export interface SlatePluginsProps
  extends UseSlatePluginsEffectsOptions,
    UseSlatePropsOptions {
  children: React.ReactNode;
}

export const SlatePlugins = ({ children, ...options }: SlatePluginsProps) => {
  const { getSlateProps } = useSlatePlugins(options);

  const slateProps = getSlateProps() as SlateProps;

  if (!slateProps.editor) return null;

  return (
    <Slate key={(slateProps.editor as any).key} {...slateProps}>
      {children}
    </Slate>
  );
};
