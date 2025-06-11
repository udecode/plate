'use client';

import { createPlatePlugin } from 'platejs/react';

import { FixedToolbar } from '@/registry/ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/registry/ui/fixed-toolbar-buttons';

export const FixedToolbarKit = [
  createPlatePlugin({
    key: 'fixed-toolbar',
    render: {
      beforeEditable: () => (
        <FixedToolbar>
          <FixedToolbarButtons />
        </FixedToolbar>
      ),
    },
  }),
];
