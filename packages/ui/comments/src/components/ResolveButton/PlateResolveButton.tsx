import React from 'react';
import { ResolveButton } from './ResolveButton';
import { ResolveButtonCheckProps } from './ResolveButtonCheck';
import { ResolveButtonRootProps } from './ResolveButtonRoot';
import { resolveButtonRootStyles } from './styles';

export type PlateResolveButtonProps = ResolveButtonRootProps &
  ResolveButtonCheckProps;

export const PlateResolveButton = (props: PlateResolveButtonProps) => {
  return (
    <ResolveButton.Root {...props} css={resolveButtonRootStyles}>
      <ResolveButton.Check />
    </ResolveButton.Root>
  );
};
