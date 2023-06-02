import React from 'react';

import { Icons } from '@/components/icons';
import {
  ToolbarButton,
  ToolbarButtonProps,
} from '@/components/ui/toolbar-button';
import { useLinkToolbarButtonProps } from '@/lib/@/useLinkToolbarButtonProps';

export function LinkToolbarButton(props: ToolbarButtonProps) {
  const linkToolbarButtonProps = useLinkToolbarButtonProps();

  return (
    <ToolbarButton tooltip="Link" {...linkToolbarButtonProps} {...props}>
      <Icons.link />
    </ToolbarButton>
  );
}
