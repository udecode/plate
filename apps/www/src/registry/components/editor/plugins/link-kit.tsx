'use client';

import { LinkPlugin } from '@udecode/plate-link/react';

import { LinkElement } from '@/registry/ui/link-node';
import { LinkFloatingToolbar } from '@/registry/ui/link-toolbar';

export const LinkKit = [
  LinkPlugin.configure({
    render: {
      node: LinkElement,
      afterEditable: () => <LinkFloatingToolbar />,
    },
  }),
];
