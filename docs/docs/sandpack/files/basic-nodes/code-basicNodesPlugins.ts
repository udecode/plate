export const basicNodesPluginsCode = `import { basicElementsPlugins } from '../basic-elements/basicElementsPlugins';
import { basicMarksPlugins } from '../basic-marks/basicMarksPlugins';
import { plateUI } from '../common/plateUI';
import { createMyPlugins } from '../typescript/plateTypes';

export const basicNodesPlugins = createMyPlugins(
  [...basicElementsPlugins, ...basicMarksPlugins],
  {
    components: plateUI,
  }
);
`;

export const basicNodesPluginsFile = {
  '/basic-nodes/basicNodesPlugins.ts': basicNodesPluginsCode,
};
