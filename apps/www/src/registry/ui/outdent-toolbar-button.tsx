'use client';

import * as React from 'react';

import { useOutdentButton } from '@udecode/plate-indent/react';
import { Outdent } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export function OutdentToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const { props: buttonProps } = useOutdentButton();

  return (
    <ToolbarButton {...props} {...buttonProps} tooltip="Outdent">
      <Outdent />
    </ToolbarButton>
  );
}
