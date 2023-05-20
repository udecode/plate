import {
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createHeadingPlugin,
  createParagraphPlugin,
} from '@udecode/plate';
import { plateUI } from '../common/plateUI';
import { createMyPlugins } from '../../apps/next/src/lib/plate/typescript/plateTypes';

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
