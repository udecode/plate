import { ELEMENT_H1 } from '@udecode/plate-heading';
import { NormalizeTypesPlugin } from '@udecode/plate-normalizers';

import { MyPlatePlugin } from '@/plate/plate.types';

export const forcedLayoutPlugin: Partial<MyPlatePlugin<NormalizeTypesPlugin>> =
  {
    options: {
      rules: [{ path: [0], strictType: ELEMENT_H1 }],
    },
  };
