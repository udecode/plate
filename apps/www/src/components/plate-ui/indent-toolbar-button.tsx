import React from 'react';
import { useIndentButton } from '@udecode/plate-indent';

import { Icons } from '@/components/icons';
import { ToolbarButton } from '@/components/ui/toolbar';

export function IndentToolbarButton() {
  const { props } = useIndentButton();

  return (
    <ToolbarButton tooltip="Indent" {...props}>
      <Icons.indent />
    </ToolbarButton>
  );
}
