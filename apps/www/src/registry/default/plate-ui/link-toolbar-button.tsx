import React from 'react';
import {
  useLinkToolbarButton,
  useLinkToolbarButtonState,
} from '@udecode/plate-link';

import { withRef } from '@/lib/utils';
import { Icons } from '@/components/icons';

import { ToolbarButton } from './toolbar';

export const LinkToolbarButton = withRef(ToolbarButton, (rest, ref) => {
  const state = useLinkToolbarButtonState();
  const { props } = useLinkToolbarButton(state);

  return (
    <ToolbarButton ref={ref} tooltip="Link" {...props} {...rest}>
      <Icons.link />
    </ToolbarButton>
  );
});
