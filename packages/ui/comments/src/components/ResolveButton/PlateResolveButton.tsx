import React from 'react';
import { IconButton } from '@mui/material';
import { Check } from '@styled-icons/material';
import { Thread } from '@udecode/plate-comments';
import { ResolveButton } from './ResolveButton';
import { resolveButtonCss } from './styles';

export type PlateResolveButtonProps = {
  thread: Thread;
  onResolveThread: () => void;
  isAssignedToLoggedInUser?: boolean;
};

export const PlateResolveButton = (props: PlateResolveButtonProps) => {
  const { isAssignedToLoggedInUser } = props;

  return (
    <IconButton>
      <ResolveButton.Root {...props} css={resolveButtonCss}>
        <Check
          size={22}
          color={isAssignedToLoggedInUser ? 'white' : 'default'}
        />
      </ResolveButton.Root>
    </IconButton>
  );
};
