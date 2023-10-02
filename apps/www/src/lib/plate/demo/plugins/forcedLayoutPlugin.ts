import { PlatePlugin } from '@udecode/plate-common';
import { ELEMENT_H1 } from '@udecode/plate-heading';
import { NormalizeTypesPlugin } from '@udecode/plate-normalizers';

export const forcedLayoutPlugin: Partial<PlatePlugin<NormalizeTypesPlugin>> = {
  options: {
    rules: [{ path: [0], strictType: ELEMENT_H1 }],
  },
};
