import {
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createHeadingPlugin,
  createParagraphPlugin,
} from '@udecode/plate';

import { plateUI } from '@/plate/common/plateUI';
import { createMyPlugins } from '@/plate/typescript/plateTypes';

export const basicElementsPlugins = createMyPlugins(
  [
    createBlockquotePlugin(),
    createCodeBlockPlugin(),
    createHeadingPlugin(),
    createParagraphPlugin(),
  ],
  {
    components: plateUI,
  }
);
