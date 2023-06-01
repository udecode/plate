import React from 'react';
import { ListStyleType } from '@udecode/plate';

import { Icons } from '@/components/icons';
import {
  ToolbarButton,
  ToolbarButtonProps,
} from '@/components/ui/toolbar-button';
import { useIndentListToolbarButtonProps } from '@/lib/@/useIndentListToolbarButtonProps';

export function IndentListToolbarButton({
  nodeType = ListStyleType.Disc,
  ...props
}: ToolbarButtonProps & { nodeType?: ListStyleType }) {
  const indentListToolbarButtonProps = useIndentListToolbarButtonProps({
    nodeType,
  });

  return (
    <ToolbarButton
      tooltip={
        nodeType === ListStyleType.Disc ? 'Bulleted List' : 'Numbered List'
      }
      {...indentListToolbarButtonProps}
      {...props}
    >
      {nodeType === ListStyleType.Disc ? <Icons.ul /> : <Icons.ol />}
    </ToolbarButton>
  );
}
