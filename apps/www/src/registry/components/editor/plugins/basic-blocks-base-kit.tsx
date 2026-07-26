import {
  BaseBlockquotePlugin,
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
  BaseHorizontalRulePlugin,
} from '@platejs/basic-nodes';
import { BaseParagraphPlugin } from 'platejs';

import { BlockquoteElementStatic } from '@/registry/ui/blockquote-node-static';
import {
  H1ElementStatic,
  H2ElementStatic,
  H3ElementStatic,
  H4ElementStatic,
  H5ElementStatic,
  H6ElementStatic,
} from '@/registry/ui/heading-node-static';
import { HrElementStatic } from '@/registry/ui/hr-node-static';
import { ParagraphElementStatic } from '@/registry/ui/paragraph-node-static';

export const BaseBasicBlocksKit = [
  BaseParagraphPlugin.configure({
    component: ParagraphElementStatic,
  }),
  BaseH1Plugin.configure({ component: H1ElementStatic }),
  BaseH2Plugin.configure({ component: H2ElementStatic }),
  BaseH3Plugin.configure({ component: H3ElementStatic }),
  BaseH4Plugin.configure({ component: H4ElementStatic }),
  BaseH5Plugin.configure({ component: H5ElementStatic }),
  BaseH6Plugin.configure({ component: H6ElementStatic }),
  BaseBlockquotePlugin.configure({
    component: BlockquoteElementStatic,
  }),
  BaseHorizontalRulePlugin.configure({
    component: HrElementStatic,
  }),
];
