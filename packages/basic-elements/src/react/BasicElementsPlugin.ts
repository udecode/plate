import { createPlatePlugin } from '@udecode/plate/react';

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
export const BasicElementsPlugin = createPlatePlugin({
  plugins: [BlockquotePlugin, HeadingPlugin, HorizontalRulePlugin],
});
