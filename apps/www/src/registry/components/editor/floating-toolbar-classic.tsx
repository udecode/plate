'use client';

import { definePlatePlugin } from 'platejs/react';

import { FloatingToolbar } from '@/registry/components/editor/floating-toolbar';
import { FloatingToolbarButtons } from '@/registry/components/editor/floating-toolbar-classic-buttons';

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
