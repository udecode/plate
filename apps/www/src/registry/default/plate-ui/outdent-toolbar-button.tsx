import React from 'react';
import { useOutdentButton } from '@udecode/plate-indent';
import { ToolbarButton } from './toolbar';

import { Icons } from '@/components/icons';

export function OutdentToolbarButton() {
  const { props } = useOutdentButton();

  return (
    <ToolbarButton tooltip="Outdent" {...props}>
      <Icons.outdent />
    </ToolbarButton>
  );
}
