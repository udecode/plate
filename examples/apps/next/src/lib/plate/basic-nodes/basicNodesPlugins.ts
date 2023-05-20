import { basicElementsPlugins } from '../basic-elements/basicElementsPlugins';
import { basicMarksPlugins } from '../basic-marks/basicMarksPlugins';
import { plateUI } from '../common/plateUI';
import { createMyPlugins } from '../../apps/next/src/lib/plate/typescript/plateTypes';

export const basicNodesPlugins = createMyPlugins(
  [...basicElementsPlugins, ...basicMarksPlugins],
  {
    components: plateUI,
  }
);
