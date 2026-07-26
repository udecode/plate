'use client';

import {
  BlockquoteRules,
  HeadingRules,
  HorizontalRuleRules,
} from '@platejs/basic-nodes';
import {
  BlockquotePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  H4Plugin,
  H5Plugin,
  H6Plugin,
  HorizontalRulePlugin,
} from '@platejs/basic-nodes/react';
import { ParagraphPlugin } from 'platejs/react';

import { BlockquoteElement } from '@/registry/ui/blockquote-node';
import {
  H1Element,
  H2Element,
  H3Element,
  H4Element,
  H5Element,
  H6Element,
} from '@/registry/ui/heading-node';
import { HrElement } from '@/registry/ui/hr-node';
import { ParagraphElement } from '@/registry/ui/paragraph-node';

export const BasicBlocksKit = [
  ParagraphPlugin.configure({ component: ParagraphElement }),
  H1Plugin.configure({
    component: H1Element,
    inputRules: [HeadingRules.markdown()],
    rules: {
      break: { empty: 'reset' },
    },
    shortcuts: { toggle: { keys: 'mod+alt+1' } },
  }),
  H2Plugin.configure({
    component: H2Element,
    inputRules: [HeadingRules.markdown()],
    rules: {
      break: { empty: 'reset' },
    },
    shortcuts: { toggle: { keys: 'mod+alt+2' } },
  }),
  H3Plugin.configure({
    component: H3Element,
    inputRules: [HeadingRules.markdown()],
    rules: {
      break: { empty: 'reset' },
    },
    shortcuts: { toggle: { keys: 'mod+alt+3' } },
  }),
  H4Plugin.configure({
    component: H4Element,
    inputRules: [HeadingRules.markdown()],
    rules: {
      break: { empty: 'reset' },
    },
    shortcuts: { toggle: { keys: 'mod+alt+4' } },
  }),
  H5Plugin.configure({
    component: H5Element,
    inputRules: [HeadingRules.markdown()],
    rules: {
      break: { empty: 'reset' },
    },
    shortcuts: { toggle: { keys: 'mod+alt+5' } },
  }),
  H6Plugin.configure({
    component: H6Element,
    inputRules: [HeadingRules.markdown()],
    rules: {
      break: { empty: 'reset' },
    },
    shortcuts: { toggle: { keys: 'mod+alt+6' } },
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
];
