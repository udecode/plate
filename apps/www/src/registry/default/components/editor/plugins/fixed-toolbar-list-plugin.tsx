'use client';

import { createPlatePlugin } from '@udecode/plate-common/react';

import { FixedToolbar } from '@/registry/default/plate-ui/fixed-toolbar';
import { FixedToolbarListButtons } from '@/registry/default/plate-ui/fixed-toolbar-list-buttons';

export const FixedToolbarListPlugin = createPlatePlugin({
  render: {
    beforeEditable: () => (
      <FixedToolbar>
        <FixedToolbarListButtons />
      </FixedToolbar>
    ),
  },
});
