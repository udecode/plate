import {
  BaseBlockquotePlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
} from '@platejs/basic-nodes';
import { BaseParagraphPlugin } from 'platejs';

import { BlockquoteElementStatic } from '@/registry/components/editor/blockquote-static';
import { HeadingElementStatic } from '@/registry/components/editor/heading-static';
import { HrElementStatic } from '@/registry/components/editor/horizontal-rule-static';
import { ParagraphElementStatic } from '@/registry/components/editor/paragraph-static';

export const BaseBasicBlocksKit = [
  BaseParagraphPlugin.configure({
    component: ParagraphElementStatic,
  }),
  BaseHeadingPlugin.configure({ component: HeadingElementStatic }),
  BaseBlockquotePlugin.configure({
    component: BlockquoteElementStatic,
  }),
  BaseHorizontalRulePlugin.configure({
    component: HrElementStatic,
  }),
];
