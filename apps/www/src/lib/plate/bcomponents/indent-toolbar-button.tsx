import React from 'react';

import { Icons } from '@/components/icons';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useOutdentButtonProps } from '@/lib/@/useOutdentButtonProps';

export function IndentToolbarButton() {
  const indentProps = useOutdentButtonProps();

  return (
    <ToolbarButton tooltip="Indent" {...indentProps}>
      <Icons.indent />
    </ToolbarButton>
  );
}
