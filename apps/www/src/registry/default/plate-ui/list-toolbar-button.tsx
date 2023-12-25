import React from 'react';
import {
  ELEMENT_UL,
  useListToolbarButton,
  useListToolbarButtonState,
} from '@udecode/plate-list';

import { extendProps } from '@/lib/utils';
import { Icons } from '@/components/icons';

import { ToolbarButton } from './toolbar';

export const ListToolbarButton = extendProps(ToolbarButton)<{
  nodeType?: string;
}>(({ nodeType = ELEMENT_UL, ...rest }, ref) => {
  const state = useListToolbarButtonState({ nodeType });
  const { props } = useListToolbarButton(state);

  return (
    <ToolbarButton
      ref={ref}
      tooltip={nodeType === ELEMENT_UL ? 'Bulleted List' : 'Numbered List'}
      {...props}
      {...rest}
    >
      {nodeType === ELEMENT_UL ? <Icons.ul /> : <Icons.ol />}
    </ToolbarButton>
  );
});
