import {
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createHeadingPlugin,
  createParagraphPlugin,
  createPlateUI,
} from '@udecode/plate';
import { basicMarkPlugins } from '../basic-marks/basicMarkPlugins';
import { createMyPlugins } from '../typescript/plate.types';

export const basicElementPlugins = createMyPlugins(
  [
    createBlockquotePlugin(),
    createCodeBlockPlugin(),
    createHeadingPlugin(),
    createParagraphPlugin(),
  ],
  {
    components: createPlateUI(),
  }
);

// TODO
export const basicNodes = createMyPlugins(
  [...basicElementPlugins, ...basicMarkPlugins],
  {
    components: createPlateUI(),
  }
);
