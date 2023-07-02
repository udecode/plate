import { PlatePlugin } from '@udecode/plate-core';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';

export const trailingBlockPlugin: Partial<PlatePlugin<TrailingBlockPlugin>> = {
  options: { type: ELEMENT_PARAGRAPH },
};
