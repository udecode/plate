import React from 'react';
import {
  useLinkToolbarButton,
  useLinkToolbarButtonState,
} from '@udecode/plate-link';

import { Icons } from '@/components/icons';
import { ToolbarButton } from '@/registry/default/ui/toolbar';

export function LinkToolbarButton() {
  const state = useLinkToolbarButtonState();
  const { props } = useLinkToolbarButton(state);

  return (
    <ToolbarButton tooltip="Link" {...props}>
      <Icons.link />
    </ToolbarButton>
  );
}
