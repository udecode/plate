import { BlockSelectionPlugin } from '@udecode/plate-selection';

import { MyPlatePlugin } from '@/plate/plate.types';

export const blockSelectionPlugin: Partial<MyPlatePlugin> = {
  options: {
    sizes: {
      left: 76,
      top: 0,
      right: 76,
      bottom: 0,
    },
  } as BlockSelectionPlugin,
};
