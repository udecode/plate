import { createSlatePlugin } from '@udecode/plate';

import { BaseBlockquotePlugin } from './BaseBlockquotePlugin';
import { BaseHeadingPlugin } from './BaseHeadingPlugin';
import { BaseHorizontalRulePlugin } from './BaseHorizontalRulePlugin';

export const BaseBasicElementsPlugin = createSlatePlugin({
  plugins: [BaseBlockquotePlugin, BaseHeadingPlugin, BaseHorizontalRulePlugin],
});
