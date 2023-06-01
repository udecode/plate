import React from 'react';

import { Icons } from '@/components/icons';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useIndentButtonProps } from '@/lib/@/useIndentButtonProps';

export function IndentToolbarButton() {
  const indentProps = useIndentButtonProps();

  return (
    <ToolbarButton tooltip="Indent" {...indentProps}>
      <Icons.indent />
    </ToolbarButton>
  );
}
