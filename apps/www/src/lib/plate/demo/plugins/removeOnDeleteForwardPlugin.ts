import { PlatePlugin } from '@udecode/plate-common';
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
