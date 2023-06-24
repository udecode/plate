import { ELEMENT_HR } from '@udecode/plate-horizontal-rule';
import { ELEMENT_IMAGE } from '@udecode/plate-media';
import { SelectOnBackspacePlugin } from '@udecode/plate-select';

import { MyPlatePlugin } from '@/types/plate-types';

export const selectOnBackspacePlugin: Partial<
  MyPlatePlugin<SelectOnBackspacePlugin>
> = {
  options: {
    query: {
      allow: [ELEMENT_IMAGE, ELEMENT_HR],
    },
  },
};
