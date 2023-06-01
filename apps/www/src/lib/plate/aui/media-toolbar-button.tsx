import React from 'react';
import { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED } from '@udecode/plate';

import { Icons } from '@/components/icons';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useMediaToolbarButtonProps } from '@/lib/@/useMediaToolbarButtonProps';

export function MediaToolbarButton({
  nodeType,
}: {
  nodeType?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
}) {
  return (
    <ToolbarButton {...useMediaToolbarButtonProps({ nodeType })}>
      <Icons.image />
    </ToolbarButton>
  );
}
