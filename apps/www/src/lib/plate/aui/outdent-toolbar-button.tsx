import React from 'react';

import { Icons } from '@/components/icons';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useOutdentButtonProps } from '@/lib/@/useOutdentButtonProps';

export function OutdentToolbarButton() {
  const outdentProps = useOutdentButtonProps();

  return (
    <ToolbarButton tooltip="Outdent" {...outdentProps}>
      <Icons.outdent />
    </ToolbarButton>
  );
}
