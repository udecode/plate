import React from 'react';
import { useOutdentButton } from '@udecode/plate-indent';

import { withRef } from '@/lib/utils';
import { Icons } from '@/components/icons';

import { ToolbarButton } from './toolbar';

export const OutdentToolbarButton = withRef<typeof ToolbarButton>((rest) => {
  const { props } = useOutdentButton();

  return (
    <ToolbarButton tooltip="Outdent" {...props} {...rest}>
      <Icons.outdent />
    </ToolbarButton>
  );
});
