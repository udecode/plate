import { ELEMENT_PARAGRAPH, TrailingBlockPlugin } from '@udecode/plate';
import { MyPlatePlugin } from '../../apps/next/src/lib/plate/typescript/plateTypes';

export const trailingBlockPlugin: Partial<MyPlatePlugin<TrailingBlockPlugin>> =
  {
    options: { type: ELEMENT_PARAGRAPH },
  };
