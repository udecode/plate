import React from 'react';
import { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED } from '@udecode/plate';

import { Icons } from '@/components/icons';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useMediaToolbarButton } from '@/lib/@/useMediaToolbarButton';

export function MediaToolbarButton({
  nodeType,
}: {
  nodeType?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
}) {
  const { props } = useMediaToolbarButton({ nodeType });

  return (
    <ToolbarButton {...props}>
      <Icons.image />
    </ToolbarButton>
  );
}
