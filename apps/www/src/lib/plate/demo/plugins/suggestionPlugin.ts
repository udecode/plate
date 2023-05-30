import { InjectComponent } from '@udecode/plate';
import { SuggestionPlugin } from '@udecode/plate-suggestion';

import { InjectSuggestion } from '@/plate/aui/inject-suggestion';
import { MyPlatePlugin, MyValue } from '@/plate/demo/plate.types';

export const suggestionPlugin: Partial<MyPlatePlugin<SuggestionPlugin>> = {
  inject: {
    aboveComponent: InjectSuggestion as InjectComponent<MyValue>,
  },
  options: {
    currentUserId: '1',
  },
};
