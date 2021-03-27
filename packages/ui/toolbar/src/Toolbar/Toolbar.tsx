import * as React from 'react';
import { getRootClassNames } from '@udecode/slate-plugins-ui-fluent';
import { concatStyleSets } from '@uifabric/styling';
import { getToolbarStyles } from './Toolbar.styles';
import { ToolbarProps } from './Toolbar.types';

const getClassNames = getRootClassNames();

export const ToolbarBase = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, styles, children }, ref) => {
    const classNames = getClassNames(styles, {
      className,
    });

    return (
      <div data-testid="Toolbar" className={classNames.root} ref={ref}>
        {children}
      </div>
    );
  }
);

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ styles, ...props }: ToolbarProps, ref) => (
    <ToolbarBase
      {...props}
      ref={ref}
      styles={concatStyleSets(getToolbarStyles(styles))}
    />
  )
);
