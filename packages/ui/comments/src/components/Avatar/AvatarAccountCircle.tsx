import React, { ComponentProps } from 'react';
import { AccountCircle } from '@styled-icons/material';
import { createComponentAs } from '@udecode/plate-core';

export type AvatarAccountCircleProps = ComponentProps<typeof AccountCircle>;

export const AvatarAccountCircle = createComponentAs(
  (props: AvatarAccountCircleProps) => <AccountCircle {...props} />
);
