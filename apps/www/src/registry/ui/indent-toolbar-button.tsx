'use client';

import * as React from 'react';

import { useIndentButton } from '@udecode/plate-indent/react';
import { Indent } from 'lucide-react';

import { ToolbarButton } from './toolbar';

export function IndentToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const { props: buttonProps } = useIndentButton();

  return (
    <ToolbarButton {...props} {...buttonProps} tooltip="Indent">
      <Indent />
    </ToolbarButton>
  );
}
