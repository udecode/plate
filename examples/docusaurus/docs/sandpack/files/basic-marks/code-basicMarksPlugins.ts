export const basicMarksPluginsCode = `import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createPlateUI,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createUnderlinePlugin,
} from '@udecode/plate';
import { createMyPlugins } from '../typescript/plateTypes';

export const basicMarksPlugins = createMyPlugins(
  [
    createBoldPlugin(),
    createCodePlugin(),
    createItalicPlugin(),
    createStrikethroughPlugin(),
    createSubscriptPlugin(),
    createSuperscriptPlugin(),
    createUnderlinePlugin(),
  ],
  {
    components: createPlateUI(),
  }
);
`;

export const basicMarksPluginsFile = {
  '/basic-marks/basicMarksPlugins.ts': basicMarksPluginsCode,
};
