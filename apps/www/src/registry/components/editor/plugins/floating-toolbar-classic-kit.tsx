'use client';

import { definePlatePlugin } from 'platejs/react';

import { FloatingToolbar } from '@/registry/ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/registry/ui/floating-toolbar-classic-buttons';

export const FloatingToolbarKit = [
  definePlatePlugin('floatingToolbar', {
    render: {
      afterEditable: () => (
        <FloatingToolbar>
          <FloatingToolbarButtons />
        </FloatingToolbar>
      ),
    },
  }),
];
