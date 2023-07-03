import { plateUI } from '@/plate/demo/plateUI';

import { createMyPlugins } from '@/types/plate-types';

import { basicElementsPlugins } from './basicElementsPlugins';
import { basicMarksPlugins } from './basicMarksPlugins';

export const basicNodesPlugins = createMyPlugins(
  [...basicElementsPlugins, ...basicMarksPlugins],
  {
    components: plateUI,
  }
);
