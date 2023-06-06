import { InjectComponent } from '@udecode/plate-common';
import { SuggestionPlugin } from '@udecode/plate-suggestion';

import { InjectSuggestion } from '@/components/plate-ui/inject-suggestion';
import { MyPlatePlugin, MyValue } from '@/plate/plate.types';

export const suggestionPlugin: Partial<MyPlatePlugin<SuggestionPlugin>> = {
  inject: {
    aboveComponent: InjectSuggestion as InjectComponent<MyValue>,
  },
  options: {
    currentUserId: '1',
  },
};
