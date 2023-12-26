import React from 'react';
import { useIndentButton } from '@udecode/plate-indent';

import { withRef } from '@/lib/utils';
import { Icons } from '@/components/icons';

import { ToolbarButton } from './toolbar';

export const IndentToolbarButton = withRef<typeof ToolbarButton>((rest) => {
  const { props } = useIndentButton();

  return (
    <ToolbarButton tooltip="Indent" {...props} {...rest}>
      <Icons.indent />
    </ToolbarButton>
  );
});
