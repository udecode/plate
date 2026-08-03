'use client';

import { definePlatePlugin } from 'platejs/react';

import { FixedToolbar } from '@/registry/ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/registry/ui/fixed-toolbar-classic-buttons';

export const FixedToolbarKit = [
  definePlatePlugin('fixedToolbar', {
    render: {
      beforeEditable: () => (
        <FixedToolbar>
          <FixedToolbarButtons />
        </FixedToolbar>
      ),
    },
  }),
];
