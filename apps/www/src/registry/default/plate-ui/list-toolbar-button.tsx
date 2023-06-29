import React from 'react';
import {
  ELEMENT_UL,
  useListToolbarButton,
  useListToolbarButtonState,
} from '@udecode/plate-list';
import { ToolbarButton } from './toolbar';

import { Icons } from '@/components/icons';

export function ListToolbarButton({
  nodeType = ELEMENT_UL,
}: {
  nodeType?: string;
}) {
  const state = useListToolbarButtonState({ nodeType });
  const { props } = useListToolbarButton(state);

  return (
    <ToolbarButton
      tooltip={nodeType === ELEMENT_UL ? 'Bulleted List' : 'Numbered List'}
      {...props}
    >
      {nodeType === ELEMENT_UL ? <Icons.ul /> : <Icons.ol />}
    </ToolbarButton>
  );
}
