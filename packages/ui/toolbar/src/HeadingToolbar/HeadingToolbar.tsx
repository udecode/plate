import React from 'react';
import { ToolbarBase } from '../Toolbar/Toolbar';
import { ToolbarProps } from '../Toolbar/Toolbar.types';
import { getHeadingToolbarStyles } from './HeadingToolbar.styles';

export const HeadingToolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  (props: ToolbarProps, ref) => {
    const styles = getHeadingToolbarStyles(props);

    return (
      <ToolbarBase
        ref={ref}
        className={styles.root.className}
        css={styles.root.css}
        {...props}
      />
    );
  }
);
