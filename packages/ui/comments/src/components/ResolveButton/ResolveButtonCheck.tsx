import React, { ComponentProps } from 'react';
import { Check } from '@styled-icons/material';
import { createComponentAs } from '@udecode/plate-core';

export type ResolveButtonCheckProps = ComponentProps<typeof Check>;

export const ResolveButtonCheck = createComponentAs(
  (props: ResolveButtonCheckProps) => {
    return <Check {...props} />;
  }
);
