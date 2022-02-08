import React, { useRef } from 'react';
import { withPlateProvider } from '@udecode/plate-core';
import { PortalBody } from '@udecode/plate-styled-components';
import { UsePopperPositionOptions } from '@udecode/plate-ui-popper';
import { ToolbarBase } from '../Toolbar/Toolbar';
import { getBalloonToolbarStyles } from './BalloonToolbar.styles';
import { BalloonToolbarProps } from './BalloonToolbar.types';
import { useBalloonToolbarPopper } from './useBalloonToolbarPopper';

export const BalloonToolbar = withPlateProvider(
  (props: BalloonToolbarProps) => {
    const {
      children,
      theme = 'dark',
      arrow = false,
      portalElement,
      popperOptions: _popperOptions = {},
    } = props;

    const popperRef = useRef<HTMLDivElement>(null);

    const popperOptions: UsePopperPositionOptions = {
      popperElement: popperRef.current,
      placement: 'top' as any,
      offset: [0, 8],
      ..._popperOptions,
    };

    const { styles: popperStyles, attributes } = useBalloonToolbarPopper(
      popperOptions
    );

    const styles = getBalloonToolbarStyles({
      popperOptions,
      theme,
      arrow,
      ...props,
    });

    return (
      <PortalBody element={portalElement}>
        <ToolbarBase
          ref={popperRef}
          css={styles.root.css}
          className={styles.root.className}
          style={popperStyles.popper}
          {...attributes.popper}
        >
          {children}
        </ToolbarBase>
      </PortalBody>
    );
  }
);
