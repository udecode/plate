import React from 'react';
import { useSlate } from 'slate-react';
import { PortalBody } from 'components/PortalBody/PortalBody';
import { getBalloonToolbarStyles } from 'components/Toolbar/BalloonToolbar/BalloonToolbar.styles';
import { BalloonToolbarProps } from 'components/Toolbar/BalloonToolbar/BalloonToolbar.types';
import { useBalloonMove } from 'components/Toolbar/BalloonToolbar/useBalloonMove';
import { useBalloonShow } from 'components/Toolbar/BalloonToolbar/useBalloonShow';
import { Toolbar } from 'components/Toolbar/Toolbar';

export const BalloonToolbar = ({
  className,
  styles,
  children,
  hiddenDelay = 0,
  direction = 'top',
  theme = 'dark',
  arrow = false,
}: BalloonToolbarProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const editor = useSlate();

  const [hidden] = useBalloonShow({ editor, ref, hiddenDelay });
  useBalloonMove({ editor, ref, direction });

  return (
    <PortalBody>
      <Toolbar
        ref={ref}
        styles={getBalloonToolbarStyles(
          className,
          styles,
          theme,
          hidden,
          hiddenDelay,
          direction,
          arrow
        )}
      >
        {children}
      </Toolbar>
    </PortalBody>
  );
};
