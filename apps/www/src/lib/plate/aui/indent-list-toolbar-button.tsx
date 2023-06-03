import React from 'react';
import { ListStyleType } from '@udecode/plate';

import { Icons } from '@/components/icons';
import {
  ToolbarButton,
  ToolbarButtonProps,
} from '@/components/ui/toolbar-button';
import {
  useIndentListToolbarButton,
  useIndentListToolbarButtonState,
} from '@/lib/@/useIndentListToolbarButton';

export function IndentListToolbarButton({
  nodeType = ListStyleType.Disc,
}: ToolbarButtonProps & { nodeType?: ListStyleType }) {
  const state = useIndentListToolbarButtonState({ nodeType });
  const { props } = useIndentListToolbarButton(state);

  return (
    <ToolbarButton
      tooltip={
        nodeType === ListStyleType.Disc ? 'Bulleted List' : 'Numbered List'
      }
      {...props}
    >
      {nodeType === ListStyleType.Disc ? <Icons.ul /> : <Icons.ol />}
    </ToolbarButton>
  );
}
