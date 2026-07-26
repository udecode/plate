'use client';

import { MentionInputPlugin, MentionPlugin } from '@platejs/mention/react';

import {
  MentionElement,
  MentionInputElement,
} from '@/registry/ui/mention-node';

export const MentionKit = [
  MentionPlugin.configure({
    component: MentionElement,
    options: {
      triggerPreviousCharPattern: /^$|^[\s"']$/,
    },
  }),
  MentionInputPlugin.configure({ component: MentionInputElement }),
];
