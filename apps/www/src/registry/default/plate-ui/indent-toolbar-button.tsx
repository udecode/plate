import React from 'react';
import { useIndentButton } from '@udecode/plate-indent';

import { withRef } from '@/lib/utils';
import { Icons } from '@/components/icons';

import { ToolbarButton } from './toolbar';

export const IndentToolbarButton = withRef(ToolbarButton, (rest, ref) => {
  const { props } = useIndentButton();

  return (
    <ToolbarButton ref={ref} tooltip="Indent" {...props} {...rest}>
      <Icons.indent />
    </ToolbarButton>
  );
});
