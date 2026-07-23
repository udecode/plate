import { createBasePlugin } from '@platejs/core';

import { BaseBlockquotePlugin } from './BaseBlockquotePlugin';
import { BaseHeadingPlugin } from './BaseHeadingPlugin';
import { BaseHorizontalRulePlugin } from './BaseHorizontalRulePlugin';

export const BaseBasicBlocksPlugin = createBasePlugin({
  key: 'basicBlocks',
  plugins: [BaseBlockquotePlugin, BaseHeadingPlugin, BaseHorizontalRulePlugin],
});
