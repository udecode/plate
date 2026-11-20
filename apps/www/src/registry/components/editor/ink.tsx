'use client';

import { InkContent, InkPlugin } from 'platejs/ink/react';

import { InkSignButton } from '@/registry/components/editor/ink-sign-button';

export const InkKit = [
  InkPlugin.configure({
    slots: {
      wrapContent: (props) => <InkContent {...props} sign={InkSignButton} />,
    },
  }),
];
