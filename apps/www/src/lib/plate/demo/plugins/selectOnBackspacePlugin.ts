import type { PlatePlugin } from '@udecode/plate-common';
import type { SelectOnBackspacePlugin } from '@udecode/plate-select';

import { ELEMENT_HR } from '@udecode/plate-horizontal-rule';
import { ELEMENT_IMAGE } from '@udecode/plate-media';

export const selectOnBackspacePlugin: Partial<
  PlatePlugin<SelectOnBackspacePlugin>
> = {
  options: {
    query: {
      allow: [ELEMENT_IMAGE, ELEMENT_HR],
    },
  },
};
