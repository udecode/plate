import { ELEMENT_PARAGRAPH, TrailingBlockPlugin } from '@udecode/plate';

import { MyPlatePlugin } from '@/types/plate.types';

export const trailingBlockPlugin: Partial<MyPlatePlugin<TrailingBlockPlugin>> =
  {
    options: { type: ELEMENT_PARAGRAPH },
  };
