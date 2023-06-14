import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import { createCodeBlockPlugin } from '@udecode/plate-code-block';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createParagraphPlugin } from '@udecode/plate-paragraph';

import { plateUI } from '@/plate/demo/plateUI';
import { createMyPlugins } from '@/plate/plate-types';

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
