import { PlatePlugin } from '@udecode/plate-common';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';

export const trailingBlockPlugin: Partial<PlatePlugin<TrailingBlockPlugin>> = {
  options: { type: ELEMENT_PARAGRAPH },
};
