import React from 'react';
import { useOutdentButton } from '@udecode/plate-indent';

import { Icons } from '@/components/icons';
import { ToolbarButton } from '@/components/ui/toolbar-button';

export function OutdentToolbarButton() {
  const { props } = useOutdentButton();

  return (
    <ToolbarButton tooltip="Outdent" {...props}>
      <Icons.outdent />
    </ToolbarButton>
  );
}
