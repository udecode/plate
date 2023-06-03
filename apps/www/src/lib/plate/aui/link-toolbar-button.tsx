import React from 'react';

import { Icons } from '@/components/icons';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import {
  useLinkToolbarButton,
  useLinkToolbarButtonState,
} from '@/lib/@/useLinkToolbarButton';

export function LinkToolbarButton() {
  const state = useLinkToolbarButtonState();
  const { props } = useLinkToolbarButton(state);

  return (
    <ToolbarButton tooltip="Link" {...props}>
      <Icons.link />
    </ToolbarButton>
  );
}
