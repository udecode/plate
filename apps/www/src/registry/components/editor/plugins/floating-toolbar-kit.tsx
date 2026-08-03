'use client';

import { definePlatePlugin } from 'platejs/react';

import { FloatingToolbar } from '@/registry/ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/registry/ui/floating-toolbar-buttons';

export const FloatingToolbarPlugin = definePlatePlugin('floatingToolbar', {
  render: {
    afterEditable: () => (
      <FloatingToolbar>
        <FloatingToolbarButtons />
      </FloatingToolbar>
    ),
  },
});

export const FloatingToolbarKit = [FloatingToolbarPlugin];
