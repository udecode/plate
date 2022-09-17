import React from 'react';
import { createPortal } from 'react-dom';
import { ThreadPosition } from '../../types';
import { CommonThreadAndSideThreadProps, PlateThread } from '../Thread';
import { sideThreadRootCss } from './styles';

export type SideThreadProps = {
  position: ThreadPosition;
} & CommonThreadAndSideThreadProps;

export const PlateSideThread = (props: SideThreadProps) => {
  const { position, ...otherProps } = props;

  return createPortal(
    <div css={sideThreadRootCss} style={{ ...position }}>
      <PlateThread
        {...otherProps}
        showResolveThreadButton
        showReOpenThreadButton={false}
        showMoreButton
      />
    </div>,
    document.body
  );
};
