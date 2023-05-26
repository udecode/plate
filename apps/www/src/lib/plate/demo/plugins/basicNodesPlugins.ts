import { basicElementsPlugins } from './basicElementsPlugins';
import { basicMarksPlugins } from './basicMarksPlugins';

import { createMyPlugins } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';

export const basicNodesPlugins = createMyPlugins(
  [...basicElementsPlugins, ...basicMarksPlugins],
  {
    components: plateUI,
  }
);
