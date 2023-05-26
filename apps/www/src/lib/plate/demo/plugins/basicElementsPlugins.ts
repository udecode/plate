import {
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createHeadingPlugin,
  createParagraphPlugin,
} from '@udecode/plate';

import { createMyPlugins } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';

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
