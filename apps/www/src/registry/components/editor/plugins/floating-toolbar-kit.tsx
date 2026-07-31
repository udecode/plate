'use client';

import { createPlatePlugin } from 'platejs/react';

import { FloatingToolbar } from '@/registry/ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/registry/ui/floating-toolbar-buttons';

export const FloatingToolbarPlugin = createPlatePlugin({
  name: 'floating-toolbar',
  render: {
    afterEditable: () => (
      <FloatingToolbar>
        <FloatingToolbarButtons />
      </FloatingToolbar>
    ),
  },
});

export const FloatingToolbarKit = [FloatingToolbarPlugin];
