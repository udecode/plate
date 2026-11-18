'use client';

import { InkLayer, InkPlugin } from 'platejs/ink/react';

import { InkSignButton } from '@/registry/components/editor/ink-sign-button';

export const InkKit = [
  InkPlugin.configure({
    slots: {
      afterEditable: ({ editableRef }) => (
        <InkLayer editableRef={editableRef} sign={InkSignButton} />
      ),
    },
  }),
];
