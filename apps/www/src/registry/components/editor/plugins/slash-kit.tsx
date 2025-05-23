'use client';

import { KEYS } from '@udecode/plate';
import {
  SlashInputPlugin,
  SlashPlugin,
} from '@udecode/plate-slash-command/react';

import { SlashInputElement } from '@/registry/ui/slash-node';

export const SlashKit = [
  SlashPlugin.extend({
    options: {
      triggerQuery: (editor) =>
        !editor.api.some({
          match: { type: editor.getType(KEYS.codeBlock) },
        }),
    },
  }),
  SlashInputPlugin.withComponent(SlashInputElement),
];
