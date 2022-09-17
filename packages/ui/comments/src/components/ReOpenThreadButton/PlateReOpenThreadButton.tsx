import React from 'react';
import { Unarchive } from '@styled-icons/material';
import { ReOpenThreadButton } from './ReOpenThreadButton';
import { reOpenThreadButtonCss, reOpenThreadIconCss } from './styles';

export type PlateReOpenThreadButtonProps = {
  onReOpenThread: () => void;
};

export const PlateReOpenThreadButton = (
  props: PlateReOpenThreadButtonProps
) => {
  return (
    <ReOpenThreadButton.Root
      {...props}
      css={reOpenThreadButtonCss}
      className="mdc-icon-button"
    >
      <div className="mdc-icon-button__ripple" />
      <Unarchive css={reOpenThreadIconCss} />
    </ReOpenThreadButton.Root>
  );
};
