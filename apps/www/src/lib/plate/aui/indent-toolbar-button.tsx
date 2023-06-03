import React from 'react';

import { Icons } from '@/components/icons';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useIndentButton } from '@/lib/@/useIndentButton';

export function IndentToolbarButton() {
  const { props } = useIndentButton();

  return (
    <ToolbarButton tooltip="Indent" {...props}>
      <Icons.indent />
    </ToolbarButton>
  );
}
