'use client';

import { SlashInputPlugin, SlashPlugin } from '@platejs/slash-command/react';
import { type BaseEditor, KEYS } from 'platejs';

import { SlashInputElement } from '@/registry/ui/slash-node';

export const SlashKit = [
  SlashPlugin.configure({
    options: {
      triggerQuery: (editor: BaseEditor) =>
        !editor.read.nodes.some({
          match: { type: editor.getType(KEYS.codeBlock) },
        }),
    },
  }),
  SlashInputPlugin.withComponent(SlashInputElement),
];
