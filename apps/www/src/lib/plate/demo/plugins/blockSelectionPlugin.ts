import { BlockSelectionPlugin } from '@udecode/plate-selection';

import { MyPlatePlugin } from '@/plate/plate.types';

export const blockSelectionPlugin: Partial<MyPlatePlugin> = {
  options: {
    sizes: {
      left: 270,
      top: 0,
      right: 0,
      bottom: 0,
    },
  } as BlockSelectionPlugin,
};
