export const basicNodesPluginsCode = `import { createComboboxPlugin, createEmojiPlugin } from '@udecode/plate';
import { basicElementsPlugins } from '../basic-elements/basicElementsPlugins';
import { basicMarksPlugins } from '../basic-marks/basicMarksPlugins';
import { plateUI } from '../common/plateUI';
import { emojiPlugin } from '../emoji/emojiPlugin';
import { createMyPlugins } from '../typescript/plateTypes';

export const basicNodesPlugins = createMyPlugins(
  [
    ...basicElementsPlugins,
    ...basicMarksPlugins,
    createComboboxPlugin(),
    createEmojiPlugin(emojiPlugin),
  ],
  {
    components: plateUI,
  }
);
`;

export const basicNodesPluginsFile = {
  '/basic-nodes/basicNodesPlugins.ts': basicNodesPluginsCode,
};
