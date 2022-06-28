export const basicNodesPluginsCode = `import { createPlateUI, ELEMENT_CODE_BLOCK } from '@udecode/plate';
import { basicElementsPlugins } from '../basic-elements/basicElementsPlugins';
import { basicMarksPlugins } from '../basic-marks/basicMarksPlugins';
import { createMyPlugins } from '../typescript/plateTypes';

export const basicNodesPlugins = createMyPlugins(
  [...basicElementsPlugins, ...basicMarksPlugins],
  {
    components: createPlateUI({
      [ELEMENT_CODE_BLOCK]: null as any,
    }),
  }
);
`;

export const basicNodesPluginsFile = {
  '/basic-nodes/basicNodesPlugins.ts': basicNodesPluginsCode,
};
