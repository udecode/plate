import React from 'react';

import { Icons } from '@/components/icons';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useOutdentButton } from '@/lib/@/useOutdentButton';

export function OutdentToolbarButton() {
  const { props } = useOutdentButton();

  return (
    <ToolbarButton tooltip="Outdent" {...props}>
      <Icons.outdent />
    </ToolbarButton>
  );
}
