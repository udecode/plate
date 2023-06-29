import React from 'react';
import { useIndentButton } from '@udecode/plate-indent';
import { ToolbarButton } from './toolbar';

import { Icons } from '@/components/icons';

export function IndentToolbarButton() {
  const { props } = useIndentButton();

  return (
    <ToolbarButton tooltip="Indent" {...props}>
      <Icons.indent />
    </ToolbarButton>
  );
}
