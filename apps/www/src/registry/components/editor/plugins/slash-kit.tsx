'use client';

import { SlashInputPlugin, SlashPlugin } from '@platejs/slash-command/react';
import { KEYS } from 'platejs';

import { SlashInputElement } from '@/registry/ui/slash-node';

export const SlashKit = [
  SlashPlugin.configure({
    initialState: {
      triggerQuery: (editor) => {
        const codeBlock = editor.plugin(KEYS.codeBlock);

        return !editor.read.nodes.some({
          match: {
            type: codeBlock.installed ? codeBlock.type : KEYS.codeBlock,
          },
        });
      },
    },
  }),
  SlashInputPlugin.configure({ component: SlashInputElement }),
];
