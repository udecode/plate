import { createPlatePlugin } from '@platejs/core/react';

import { BlockquotePlugin } from './BlockquotePlugin';
import { HeadingPlugin } from './HeadingPlugin';
import { HorizontalRulePlugin } from './HorizontalRulePlugin';

/**
 * Enables support for basic elements:
 *
 * - Block quote
 * - Code block
 * - Heading
 * - Paragraph
 */
export const BasicBlocksPlugin = createPlatePlugin({
  plugins: [BlockquotePlugin, HeadingPlugin, HorizontalRulePlugin],
});
