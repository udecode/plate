import type { PlatePlugin } from '@udecode/plate-common';
import type { TrailingBlockPlugin } from '@udecode/plate-trailing-block';

import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';

export const trailingBlockPlugin: Partial<PlatePlugin<TrailingBlockPlugin>> = {
  options: { type: ELEMENT_PARAGRAPH },
};
