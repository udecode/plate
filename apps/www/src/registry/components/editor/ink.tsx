'use client';

import { InkLayer, InkPlugin } from 'platejs/ink/react';

import { InkSignButton } from '@/registry/components/editor/ink-sign-button';

export const InkKit = [
  InkPlugin.configure({
    slots: {
      wrapContent: ({ children }) => (
        <>
          {children}
          <InkLayer sign={InkSignButton} />
        </>
      ),
    },
  }),
];
