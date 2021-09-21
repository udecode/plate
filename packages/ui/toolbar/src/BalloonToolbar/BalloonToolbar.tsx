import * as React from 'react';
import { useEventEditorId, useStoreEditorState } from '@udecode/plate-core';
import { PortalBody } from '@udecode/plate-styled-components';
import { ToolbarBase } from '../Toolbar/Toolbar';
import { getBalloonToolbarStyles } from './BalloonToolbar.styles';
import { BalloonToolbarProps } from './BalloonToolbar.types';
import { usePopupPosition } from './useBalloonPosition';

export const BalloonToolbar = (props: BalloonToolbarProps) => {
  const {
    children,
    direction = 'top',
    theme = 'dark',
    arrow = false,
    portalElement,
    scrollContainer,
  } = props;

  const ref = React.useRef<HTMLDivElement>(null);
  const editor = useStoreEditorState(useEventEditorId('focus'));

  const [popperStyles, attributes, hidden] = usePopupPosition({
    editor,
    popupElem: ref.current,
    scrollContainer,
  });

  const styles = getBalloonToolbarStyles({
    direction,
    theme,
    arrow,
    hidden,
    ...props,
  });

  return (
    <PortalBody element={portalElement}>
      <ToolbarBase
        ref={ref}
        css={styles.root.css}
        className={styles.root.className}
        style={popperStyles.popper}
        {...attributes.popper}
      >
        {children}
      </ToolbarBase>
    </PortalBody>
  );
};
