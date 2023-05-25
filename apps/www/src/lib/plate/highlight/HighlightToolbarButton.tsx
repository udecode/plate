import React from 'react';
import { MARK_HIGHLIGHT } from '@udecode/plate';

import { Icons } from '@/components/icons';
import { MarkToolbarButton } from '@/plate/toolbar/MarkToolbarButton';

export function HighlightToolbarButton() {
  return (
    <MarkToolbarButton nodeType={MARK_HIGHLIGHT}>
      <Icons.highlight />
    </MarkToolbarButton>
  );
}
