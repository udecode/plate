import React from 'react';
import {
  useLinkToolbarButton,
  useLinkToolbarButtonState,
} from '@udecode/plate-link';
import { ToolbarButton } from './toolbar';

import { Icons } from '@/components/icons';

export function LinkToolbarButton() {
  const state = useLinkToolbarButtonState();
  const { props } = useLinkToolbarButton(state);

  return (
    <ToolbarButton tooltip="Link" {...props}>
      <Icons.link />
    </ToolbarButton>
  );
}
