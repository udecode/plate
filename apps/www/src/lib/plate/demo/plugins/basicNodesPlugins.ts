import { createPlugins } from '@udecode/plate-common';

import { plateUI } from '@/plate/demo/plateUI';

import { basicElementsPlugins } from './basicElementsPlugins';
import { basicMarksPlugins } from './basicMarksPlugins';

export const basicNodesPlugins = createPlugins(
  [...basicElementsPlugins, ...basicMarksPlugins],
  {
    components: plateUI,
  }
);
