import React from 'react';
import { getMenuStyles } from './Menu.styles';
import { MenuProps } from './Menu.types';

export const Menu = (props: MenuProps) => {
  const { rootProps, ...menuProps } = props;

  const { root } = getMenuStyles(props);

  return (
    <div css={root.css} className={root.className} {...rootProps}>
      {/* <MenuBase */}
      {/*  offsetY={8} */}
      {/*  viewScroll="auto" */}
      {/*  position="anchor" */}
      {/*  {...menuProps} */}
      {/* /> */}
    </div>
  );
};
