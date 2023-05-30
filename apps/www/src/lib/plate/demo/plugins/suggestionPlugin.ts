import { InjectComponent } from '@udecode/plate';

import { InjectSuggestion } from '@/plate/bcomponents/InjectSuggestion';
import { MyPlatePlugin, MyValue } from '@/plate/demo/plate.types';

export const suggestionPlugin: Partial<MyPlatePlugin> = {
  inject: {
    aboveComponent: InjectSuggestion as InjectComponent<MyValue>,
  },
};
