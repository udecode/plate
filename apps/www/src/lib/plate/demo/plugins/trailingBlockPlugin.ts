import { ELEMENT_PARAGRAPH, TrailingBlockPlugin } from '@udecode/plate';

import { MyPlatePlugin } from '@/plate/demo/plate.types';

export const trailingBlockPlugin: Partial<MyPlatePlugin<TrailingBlockPlugin>> =
  {
    options: { type: ELEMENT_PARAGRAPH },
  };
