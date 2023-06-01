import {
  ELEMENT_HR,
  ELEMENT_IMAGE,
  SelectOnBackspacePlugin,
} from '@udecode/plate';

import { MyPlatePlugin } from '@/types/plate.types';

export const selectOnBackspacePlugin: Partial<
  MyPlatePlugin<SelectOnBackspacePlugin>
> = {
  options: {
    query: {
      allow: [ELEMENT_IMAGE, ELEMENT_HR],
    },
  },
};
