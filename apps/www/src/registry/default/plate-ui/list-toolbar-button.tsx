import React from 'react';

import { withRef } from '@udecode/cn';
import {
  ListUnorderedPlugin,
  useListToolbarButton,
  useListToolbarButtonState,
} from '@udecode/plate-list/react';

import { Icons } from '@/components/icons';

import { ToolbarButton } from './toolbar';

export const ListToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType?: string;
  }
>(({ nodeType = ListUnorderedPlugin.key, ...rest }, ref) => {
  const state = useListToolbarButtonState({ nodeType });
  const { props } = useListToolbarButton(state);

  return (
    <ToolbarButton
      ref={ref}
      tooltip={
        nodeType === ListUnorderedPlugin.key ? 'Bulleted List' : 'Numbered List'
      }
      {...props}
      {...rest}
    >
      {nodeType === ListUnorderedPlugin.key ? <Icons.ul /> : <Icons.ol />}
    </ToolbarButton>
  );
});
