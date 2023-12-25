import React from 'react';
import {
  ListStyleType,
  useIndentListToolbarButton,
  useIndentListToolbarButtonState,
} from '@udecode/plate-indent-list';

import { extendProps } from '@/lib/utils';
import { Icons } from '@/components/icons';

import { ToolbarButton } from './toolbar';

export const IndentListToolbarButton = extendProps(ToolbarButton)<{
  nodeType?: ListStyleType;
}>(({ nodeType = ListStyleType.Disc }, ref) => {
  const state = useIndentListToolbarButtonState({ nodeType });
  const { props } = useIndentListToolbarButton(state);

  return (
    <ToolbarButton
      ref={ref}
      tooltip={
        nodeType === ListStyleType.Disc ? 'Bulleted List' : 'Numbered List'
      }
      {...props}
    >
      {nodeType === ListStyleType.Disc ? <Icons.ul /> : <Icons.ol />}
    </ToolbarButton>
  );
});
