import { basicElementsPlugins } from '@/plate/basic-elements/basicElementsPlugins';
import { basicMarksPlugins } from '@/plate/basic-marks/basicMarksPlugins';
import { plateUI } from '@/plate/common/plateUI';
import { createMyPlugins } from '@/plate/typescript/plateTypes';

export const basicNodesPlugins = createMyPlugins(
  [...basicElementsPlugins, ...basicMarksPlugins],
  {
    components: plateUI,
  }
);
