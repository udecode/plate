'use client';

import {
  BlockquoteRules,
  HeadingRules,
  HorizontalRuleRules,
} from '@platejs/basic-nodes';
import {
  BlockquotePlugin,
  HeadingPlugin,
  HorizontalRulePlugin,
} from '@platejs/basic-nodes/react';
import { ParagraphPlugin } from 'platejs/react';

import { BlockquoteElement } from '@/registry/components/editor/blockquote';
import { HeadingElement } from '@/registry/components/editor/heading';
import { HrElement } from '@/registry/components/editor/horizontal-rule';
import { ParagraphElement } from '@/registry/components/editor/paragraph';

export const BasicBlocksKit = [
  ParagraphPlugin.configure({ component: ParagraphElement }),
  HeadingPlugin.configure({
    component: HeadingElement,
    inputRules: [HeadingRules.markdown()],
    rules: {
      break: { empty: 'reset' },
    },
    shortcuts: {
      toggleHeading1: {
        handler: ({ editor }) =>
          editor.plugin(HeadingPlugin).update.toggle({ level: 1 }),
        keys: 'mod+alt+1',
      },
      toggleHeading2: {
        handler: ({ editor }) =>
          editor.plugin(HeadingPlugin).update.toggle({ level: 2 }),
        keys: 'mod+alt+2',
      },
      toggleHeading3: {
        handler: ({ editor }) =>
          editor.plugin(HeadingPlugin).update.toggle({ level: 3 }),
        keys: 'mod+alt+3',
      },
      toggleHeading4: {
        handler: ({ editor }) =>
          editor.plugin(HeadingPlugin).update.toggle({ level: 4 }),
        keys: 'mod+alt+4',
      },
      toggleHeading5: {
        handler: ({ editor }) =>
          editor.plugin(HeadingPlugin).update.toggle({ level: 5 }),
        keys: 'mod+alt+5',
      },
      toggleHeading6: {
        handler: ({ editor }) =>
          editor.plugin(HeadingPlugin).update.toggle({ level: 6 }),
        keys: 'mod+alt+6',
      },
    },
  }),
  BlockquotePlugin.configure({
    component: BlockquoteElement,
    inputRules: [BlockquoteRules.markdown()],
    shortcuts: { toggle: { keys: 'mod+shift+period' } },
  }),
  HorizontalRulePlugin.configure({
    component: HrElement,
    inputRules: [
      HorizontalRuleRules.markdown({ variant: '-' }),
      HorizontalRuleRules.markdown({ variant: '_' }),
    ],
  }),
] as const;
