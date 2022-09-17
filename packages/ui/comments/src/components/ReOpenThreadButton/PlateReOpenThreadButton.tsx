import React from 'react';
import { IconButton } from '@mui/material';
import { Unarchive } from '@styled-icons/material';
import { ReOpenThreadButton } from './ReOpenThreadButton';

export type PlateReOpenThreadButtonProps = {
  onReOpenThread: () => void;
};

export const PlateReOpenThreadButton = (
  props: PlateReOpenThreadButtonProps
) => {
  return (
    <IconButton>
      <ReOpenThreadButton.Root {...props}>
        <Unarchive size={22} />
      </ReOpenThreadButton.Root>
    </IconButton>
  );
};
