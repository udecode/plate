'use client';

import { LinkRules } from '@platejs/link';
import { LinkPlugin } from '@platejs/link/react';

import { LinkElement } from '@/registry/ui/link-node';
import { LinkFloatingToolbar } from '@/registry/ui/link-toolbar';

export const LinkKit = [
  LinkPlugin.configure({
    component: LinkElement,
    inputRules: [
      LinkRules.markdown(),
      LinkRules.autolink({ variant: 'paste' }),
      LinkRules.autolink({ variant: 'space' }),
      LinkRules.autolink({ variant: 'break' }),
    ],
    render: {
      afterEditable: () => <LinkFloatingToolbar />,
    },
  }),
];
