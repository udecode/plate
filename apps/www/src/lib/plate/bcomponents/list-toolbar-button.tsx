import React from 'react';
import { ELEMENT_UL } from '@udecode/plate-list';

import { Icons } from '@/components/icons';
import {
  ToolbarButton,
  ToolbarButtonProps,
} from '@/components/ui/toolbar-button';
import { useListToolbarButtonProps } from '@/lib/@/useListToolbarButtonProps';

export function ListToolbarButton({
  nodeType = ELEMENT_UL,
  ...props
}: ToolbarButtonProps & { nodeType?: string }) {
  const listToolbarButtonProps = useListToolbarButtonProps({
    nodeType,
  });

  return (
    <ToolbarButton
      tooltip={nodeType === ELEMENT_UL ? 'Bulleted List' : 'Numbered List'}
      {...listToolbarButtonProps}
      {...props}
    >
      {nodeType === ELEMENT_UL ? <Icons.ul /> : <Icons.ol />}
    </ToolbarButton>
  );
}
