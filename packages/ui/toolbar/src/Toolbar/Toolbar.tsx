import * as React from 'react';
import { getToolbarStyles } from './Toolbar.styles';
import { ToolbarProps } from './Toolbar.types';

export const ToolbarBase = React.forwardRef<HTMLDivElement, ToolbarProps>(
  (props, ref) => {
    return <div data-testid="Toolbar" ref={ref} {...props} />;
  }
);

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  (props: ToolbarProps, ref) => {
    const { root } = getToolbarStyles(props);

    return (
      <ToolbarBase
        {...props}
        ref={ref}
        css={root.css}
        className={root.className}
      />
    );
  }
);
