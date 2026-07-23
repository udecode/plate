'use client';

import { MentionInputPlugin, MentionPlugin } from '@platejs/mention/react';

import {
  MentionElement,
  MentionInputElement,
} from '@/registry/ui/mention-node';

export const MentionKit = [
  MentionPlugin.withComponent(MentionElement).configure({
    options: {
      triggerPreviousCharPattern: /^$|^[\s"']$/,
    },
  }),
  MentionInputPlugin.withComponent(MentionInputElement),
];
