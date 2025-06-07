'use client';

import {
  BlockquotePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  HorizontalRulePlugin,
} from '@udecode/plate-basic-nodes/react';
import { ParagraphPlugin } from '@udecode/plate/react';

import { BlockquoteElement } from '@/registry/ui/blockquote-node';
import { H1Element, H2Element, H3Element } from '@/registry/ui/heading-node';
import { HrElement } from '@/registry/ui/hr-node';
import { ParagraphElement } from '@/registry/ui/paragraph-node';

export const BasicBlocksKit = [
  ParagraphPlugin.withComponent(ParagraphElement),
  H1Plugin.configure({
    node: { breakMode: { empty: 'reset' }, component: H1Element },
    shortcuts: { toggle: { keys: 'mod+alt+1' } },
  }),
  H2Plugin.configure({
    node: { breakMode: { empty: 'reset' }, component: H2Element },
    shortcuts: { toggle: { keys: 'mod+alt+2' } },
  }),
  H3Plugin.configure({
    node: { breakMode: { empty: 'reset' }, component: H3Element },
    shortcuts: { toggle: { keys: 'mod+alt+3' } },
  }),
  BlockquotePlugin.configure({
    node: { component: BlockquoteElement },
    shortcuts: { toggle: { keys: 'mod+shift+period' } },
  }),
  HorizontalRulePlugin.withComponent(HrElement),
];
