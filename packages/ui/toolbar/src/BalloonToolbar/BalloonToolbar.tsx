import React from 'react';
import { PortalBody } from '@udecode/plate-styled-components';
import { ToolbarBase } from '../Toolbar/Toolbar';
import { getBalloonToolbarStyles } from './BalloonToolbar.styles';
import { BalloonToolbarProps } from './BalloonToolbar.types';
import { useFloatingToolbar } from './useFloatingToolbar';

export const BalloonToolbar = (props: BalloonToolbarProps) => {
  const {
    children,
    theme = 'dark',
    arrow = false,
    portalElement,
    floatingOptions,
    ignoreReadOnly,
    hideToolbar,
  } = props;

  const { refs, style, placement, open } = useFloatingToolbar({
    floatingOptions,
    ignoreReadOnly,
    hideToolbar,
  });

  const styles = getBalloonToolbarStyles({
    placement,
    theme,
    arrow,
    ...props,
  });

  if (!open) return null;

  return (
    <PortalBody element={portalElement}>
      <ToolbarBase
        css={styles.root.css}
        className={styles.root.className}
        ref={refs.setFloating}
        style={style}
      >
        {children}
      </ToolbarBase>
    </PortalBody>
  );
};
