import React from 'react';
import { Check } from '@styled-icons/material';
import { css } from 'styled-components';
import { Thread } from '../../types';
import { ResolveButton } from './ResolveButton';
import { resolveButtonCss, resolveButtonIconCss } from './styles';

export type PlateResolveButtonProps = {
  thread: Thread;
  onResolveThread: () => void;
  isAssignedToLoggedInUser?: boolean;
};

export const PlateResolveButton = (props: PlateResolveButtonProps) => {
  const { isAssignedToLoggedInUser } = props;

  return (
    <ResolveButton.Root
      {...props}
      css={resolveButtonCss}
      className="mdc-icon-button"
    >
      <div className="mdc-icon-button__ripple" />
      <Check
        css={[
          resolveButtonIconCss,
          css`
            color: ${isAssignedToLoggedInUser ? 'white' : 'rgb(60, 64, 67)'};
          `,
        ]}
      />
    </ResolveButton.Root>
  );
};
