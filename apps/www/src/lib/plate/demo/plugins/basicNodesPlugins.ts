import { basicElementsPlugins } from './basicElementsPlugins';
import { basicMarksPlugins } from './basicMarksPlugins';

import { plateUI } from '@/plate/demo/plateUI';
import { createMyPlugins } from '@/plate/plate-types';

export const basicNodesPlugins = createMyPlugins(
  [...basicElementsPlugins, ...basicMarksPlugins],
  {
    components: plateUI,
  }
);
