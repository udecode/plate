import { PlatePlugin } from '@udecode/plate-common';
import { ELEMENT_HR } from '@udecode/plate-horizontal-rule';
import { ELEMENT_IMAGE } from '@udecode/plate-media';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { DeletePlugin } from '@udecode/plate-select';

export const removeOnDeleteForwardPlugin: Partial<
  PlatePlugin<DeletePlugin>
> = {
  options: {
    query: {
      allow: [ELEMENT_PARAGRAPH],
    },
  },
};
