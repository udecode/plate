import React, { ComponentProps } from 'react';
import { Unarchive } from '@styled-icons/material';
import { createComponentAs } from '@udecode/plate-core';

export type ReOpenThreadUnarchiveProps = ComponentProps<typeof Unarchive>;

export const ReOpenThreadUnarchive = createComponentAs(
  (props: ReOpenThreadUnarchiveProps) => {
    return <Unarchive {...props} />;
  }
);
