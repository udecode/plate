import { createPlateUI, ELEMENT_CODE_BLOCK } from '@udecode/plate';
import { basicMarksPlugins } from '../basic-marks/basicMarksPlugins';
import { createMyPlugins } from '../typescript/plateTypes';
import { basicElementsPlugins } from './basicElementsPlugins';

export const basicNodesPlugins = createMyPlugins(
  [...basicElementsPlugins, ...basicMarksPlugins],
  {
    components: createPlateUI({
      [ELEMENT_CODE_BLOCK]: null as any,
    }),
  }
);
