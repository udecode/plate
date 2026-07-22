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
  ParagraphPlugin.withComponent(ParagraphElement),
  H1Plugin.configure({
    inputRules: [HeadingRules.markdown()],
    render: { node: H1Element },
    rules: {
      break: { empty: 'reset' },
    },
    shortcuts: { toggle: { keys: 'mod+alt+1' } },
  }),
  H2Plugin.configure({
    inputRules: [HeadingRules.markdown()],
    render: { node: H2Element },
    rules: {
      break: { empty: 'reset' },
    },
    shortcuts: { toggle: { keys: 'mod+alt+2' } },
  }),
  H3Plugin.configure({
    inputRules: [HeadingRules.markdown()],
    render: { node: H3Element },
    rules: {
      break: { empty: 'reset' },
    },
    shortcuts: { toggle: { keys: 'mod+alt+3' } },
  }),
  H4Plugin.configure({
    inputRules: [HeadingRules.markdown()],
    render: { node: H4Element },
    rules: {
      break: { empty: 'reset' },
    },
    shortcuts: { toggle: { keys: 'mod+alt+4' } },
  }),
  H5Plugin.configure({
    inputRules: [HeadingRules.markdown()],
    render: { node: H5Element },
    rules: {
      break: { empty: 'reset' },
    },
    shortcuts: { toggle: { keys: 'mod+alt+5' } },
  }),
  H6Plugin.configure({
    inputRules: [HeadingRules.markdown()],
    render: { node: H6Element },
    rules: {
      break: { empty: 'reset' },
    },
    shortcuts: { toggle: { keys: 'mod+alt+6' } },
  }),
  BlockquotePlugin.configure({
    inputRules: [BlockquoteRules.markdown()],
    render: { node: BlockquoteElement },
    shortcuts: { toggle: { keys: 'mod+shift+period' } },
  }),
  HorizontalRulePlugin.configure({
    inputRules: [
      HorizontalRuleRules.markdown({ variant: '-' }),
      HorizontalRuleRules.markdown({ variant: '_' }),
    ],
    render: { node: HrElement },
  }),
];
