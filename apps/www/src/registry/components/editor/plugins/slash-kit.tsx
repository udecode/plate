'use client';

import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import {
  SlashInputPlugin,
  SlashPlugin,
} from '@udecode/plate-slash-command/react';

import { SlashInputElement } from '@/registry/ui/slash-node';

export const SlashKit = [
  SlashPlugin.extend({
    options: {
      triggerQuery(editor) {
        return !editor.api.some({
          match: { type: editor.getType(CodeBlockPlugin) },
        });
      },
    },
  }),
  SlashInputPlugin.withComponent(SlashInputElement),
];
