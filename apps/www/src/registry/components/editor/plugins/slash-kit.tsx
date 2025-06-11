'use client';

import { KEYS } from 'platejs';
import { SlashInputPlugin, SlashPlugin } from '@platejs/slash-command/react';

import { SlashInputElement } from '@/registry/ui/slash-node';

export const SlashKit = [
  SlashPlugin.configure({
    options: {
      triggerQuery: (editor) =>
        !editor.api.some({
          match: { type: editor.getType(KEYS.codeBlock) },
        }),
    },
  }),
  SlashInputPlugin.withComponent(SlashInputElement),
];
