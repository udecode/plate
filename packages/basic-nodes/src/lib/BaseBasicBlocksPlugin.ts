import { createBasePlugin } from '@platejs/core';

import { BaseBlockquotePlugin } from './BaseBlockquotePlugin';
import { BaseHeadingPlugin } from './BaseHeadingPlugin';
import { BaseHorizontalRulePlugin } from './BaseHorizontalRulePlugin';

export const BaseBasicBlocksPlugin = createBasePlugin({
  plugins: [BaseBlockquotePlugin, BaseHeadingPlugin, BaseHorizontalRulePlugin],
});
