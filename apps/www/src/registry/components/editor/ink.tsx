'use client';

import { InkContent, InkPlugin } from 'platejs/ink/react';

import { InkDigitizeBar } from '@/registry/components/editor/ink-digitize-bar';
import { InkSignButton } from '@/registry/components/editor/ink-sign-button';

export const InkKit = [
  InkPlugin.configure({
    slots: {
      afterEditable: InkDigitizeBar,
      wrapContent: (props) => <InkContent {...props} sign={InkSignButton} />,
    },
  }),
];
