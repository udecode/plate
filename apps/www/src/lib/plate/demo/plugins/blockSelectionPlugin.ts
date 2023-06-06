import { BlockSelectionPlugin } from '@udecode/plate-selection';

import { MyPlatePlugin } from '@/plate/plate.types';

export const blockSelectionPlugin: Partial<MyPlatePlugin> = {
  options: {
    sizes: {
      left: 270,
      top: 50,
      right: 313,
      bottom: 50,
    },
  } as BlockSelectionPlugin,
};
