'use client';

import { definePlatePlugin } from 'platejs/react';

import { FixedToolbar } from '@/registry/ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/registry/ui/fixed-toolbar-buttons';

export const FixedToolbarPlugin = definePlatePlugin('fixedToolbar', {
  render: {
    beforeEditable: () => (
      <FixedToolbar>
        <FixedToolbarButtons />
      </FixedToolbar>
    ),
  },
});

export const FixedToolbarKit = [FixedToolbarPlugin];
