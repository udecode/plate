import React from 'react';
import { Plate, PlateProvider } from '@udecode/plate';

import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { suggestionValue } from '@/plate/suggestion/constants';
import { MySuggestionProvider } from '@/plate/suggestion/MySuggestionsProvider';
import { PlateSuggestionToolbarDropdown } from '@/plate/suggestion/PlateSuggestionToolbarDropdown';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';

const plugins = createMyPlugins(
  []
  // [...basicNodesPlugins, createSuggestionPlugin()],
  // {
  // components: {
  //   ...plateUI,
  // [MARK_SUGGESTION]: PlateSuggestionLeaf,
  // },
  // }
);

export default function SuggestionApp() {
  return (
    <PlateProvider plugins={plugins} initialValue={suggestionValue}>
      <MySuggestionProvider>
        <HeadingToolbar>
          <PlateSuggestionToolbarDropdown />
        </HeadingToolbar>

        <Plate<MyValue> editableProps={editableProps} />
      </MySuggestionProvider>
    </PlateProvider>
  );
}
