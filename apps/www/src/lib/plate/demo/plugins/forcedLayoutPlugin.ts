import type { PlatePlugin } from '@udecode/plate-common';
import type { NormalizeTypesPlugin } from '@udecode/plate-normalizers';

import { ELEMENT_H1 } from '@udecode/plate-heading';

export const forcedLayoutPlugin: Partial<PlatePlugin<NormalizeTypesPlugin>> = {
  options: {
    rules: [{ path: [0], strictType: ELEMENT_H1 }],
  },
};
