export const basicElementsPluginsCode = `import {
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createHeadingPlugin,
  createParagraphPlugin,
  createPlateUI,
} from '@udecode/plate';
import { createMyPlugins } from '../typescript/plateTypes';

export const basicElementsPlugins = createMyPlugins(
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
`;

export const basicElementsPluginsFile = {
  '/basic-elements/basicElementsPlugins.ts': basicElementsPluginsCode,
};
