'use client';

import { SlashInputPlugin, SlashPlugin } from '@platejs/slash-command/react';
import { PLUGINS } from 'platejs';

import { SlashInputElement } from '@/registry/ui/slash-node';

export const SlashKit = [
  SlashPlugin.configure({
    initialState: {
      triggerQuery: (editor) => {
        const codeBlock = editor.plugin(PLUGINS.codeBlock);

        return !editor.read.nodes.some({
          match: {
            type: codeBlock.type,
          },
        });
      },
    },
  }),
  SlashInputPlugin.configure({ component: SlashInputElement }),
];
