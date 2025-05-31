import { createSlatePlugin } from '@udecode/plate';

import { BaseBlockquotePlugin } from './BaseBlockquotePlugin';
import { BaseHeadingPlugin } from './BaseHeadingPlugin';
import { BaseHorizontalRulePlugin } from './BaseHorizontalRulePlugin';

export const BaseBasicBlocksPlugin = createSlatePlugin({
  plugins: [BaseBlockquotePlugin, BaseHeadingPlugin, BaseHorizontalRulePlugin],
});
