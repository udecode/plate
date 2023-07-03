import { PlatePlugin } from '@udecode/plate-common';
import { ELEMENT_HR } from '@udecode/plate-horizontal-rule';
import { ELEMENT_IMAGE } from '@udecode/plate-media';
import { SelectOnBackspacePlugin } from '@udecode/plate-select';

export const selectOnBackspacePlugin: Partial<
  PlatePlugin<SelectOnBackspacePlugin>
> = {
  options: {
    query: {
      allow: [ELEMENT_IMAGE, ELEMENT_HR],
    },
  },
};
