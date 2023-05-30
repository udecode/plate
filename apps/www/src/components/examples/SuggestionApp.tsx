import React, { useState } from 'react';
import { Plate, PlateProvider } from '@udecode/plate';
import {
  createSuggestionPlugin,
  MARK_SUGGESTION,
} from '@udecode/plate-suggestion';

import { basicNodesPlugins } from '@/lib/plate/demo/plugins/basicNodesPlugins';
import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { suggestionValue } from '@/plate/suggestion/constants';
import { MySuggestionProvider } from '@/plate/suggestion/MySuggestionsProvider';
import { PlateSuggestionLeaf } from '@/plate/suggestion/PlateSuggestionLeaf';
import { PlateSuggestionToolbarDropdown } from '@/plate/suggestion/PlateSuggestionToolbarDropdown';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createSuggestionPlugin({
      options: {
        currentUserId: '1',
      },
    }),
  ],
  {
    components: {
      ...plateUI,
      [MARK_SUGGESTION]: PlateSuggestionLeaf,
    },
  }
);

export default function SuggestionApp() {
  const [, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setContainer} className="min-h-full">
      <PlateProvider plugins={plugins} initialValue={suggestionValue}>
        <MySuggestionProvider>
          <HeadingToolbar>
            <PlateSuggestionToolbarDropdown />
            {/* <UserToolbarDropdown /> */}
          </HeadingToolbar>

          <Plate<MyValue> editableProps={editableProps}>
            {/* <PlateFloatingSuggestions */}
            {/*  popoverProps={{ */}
            {/*    contentProps: { */}
            {/*      collisionBoundary: container, */}
            {/*      collisionPadding: 8, */}
            {/*    }, */}
            {/*  }} */}
            {/* /> */}
          </Plate>
        </MySuggestionProvider>
      </PlateProvider>
    </div>
  );
}
