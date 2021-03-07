import React, { useEffect } from 'react';
import { Slate } from 'slate-react';
import { useSlatePlugins } from '../hooks/useSlatePlugins/useSlatePlugins';
import { UseSlateOptions } from '../types/UseSlateOptions';

export interface SlatePluginsProps extends UseSlateOptions {
  children: React.ReactNode;
}

export const SlatePlugins = ({ children, ...options }: SlatePluginsProps) => {
  const { getSlateProps } = useSlatePlugins(options);

  const slateProps = getSlateProps();

  if (!slateProps.editor) return null;

  return (
    <Slate key={slateProps.editor.key} {...slateProps}>
      {children}
    </Slate>
  );
};
