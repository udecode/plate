import { ELEMENT_H1, NormalizeTypesPlugin } from '@udecode/plate';
import { MyPlatePlugin } from '../../apps/next/src/lib/plate/typescript/plateTypes';

export const forcedLayoutPlugin: Partial<MyPlatePlugin<NormalizeTypesPlugin>> =
  {
    options: {
      rules: [{ path: [0], strictType: ELEMENT_H1 }],
    },
  };
