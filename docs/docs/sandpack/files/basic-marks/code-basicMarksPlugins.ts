export const basicMarksPluginsCode = `import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createUnderlinePlugin,
} from '@udecode/plate';
import { plateUI } from '../common/plateUI';
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
    components: plateUI,
  }
);
`;

export const basicMarksPluginsFile = {
  '/basic-marks/basicMarksPlugins.ts': basicMarksPluginsCode,
};
