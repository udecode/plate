export const basicElementPluginsCode = `import {
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createHeadingPlugin,
  createParagraphPlugin,
  createPlateUI,
  ELEMENT_CODE_BLOCK,
} from '@udecode/plate';
import { basicMarkPlugins } from '../basic-marks/basicMarkPlugins';
import { createMyPlugins } from '../typescript/plateTypes';

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
export const basicNodePlugins = createMyPlugins(
  [...basicElementPlugins, ...basicMarkPlugins],
  {
    components: createPlateUI({
      [ELEMENT_CODE_BLOCK]: null,
    }),
  }
);
`;

export const basicElementPluginsFile = {
  '/basic-elements/basicElementPlugins.ts': basicElementPluginsCode,
};
