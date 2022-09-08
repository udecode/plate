import React from 'react';
import { ReOpenThreadButton } from './ReOpenThreadButton';
import { ReOpenThreadRootProps } from './ReOpenThreadRoot';
import { ReOpenThreadUnarchiveProps } from './ReOpenThreadUnarchive';
import { reOpenThreadButtonRootStyles } from './styles';

export type PlateReOpenThreadButtonProps = ReOpenThreadRootProps &
  ReOpenThreadUnarchiveProps;

export const PlateReOpenThreadButton = (
  props: PlateReOpenThreadButtonProps
) => {
  return (
    <ReOpenThreadButton.Root {...props} css={reOpenThreadButtonRootStyles}>
      <ReOpenThreadButton.Unarchive />
    </ReOpenThreadButton.Root>
  );
};
