import React, { useState } from 'react';
import { Plate, PlateProvider } from '@udecode/plate';
import {
  createSuggestionPlugin,
  MARK_SUGGESTION,
} from '@udecode/plate-suggestion';

import { basicNodesPlugins } from '@/lib/plate/demo/plugins/basicNodesPlugins';
import { HeadingToolbar } from '@/plate/aui/heading-toolbar';
import { SuggestionLeaf } from '@/plate/aui/suggestion-leaf';
import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { SuggestionProvider } from '@/plate/demo/suggestion/SuggestionProvider';
import { suggestionValue } from '@/plate/demo/values/suggestionValue';

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
      [MARK_SUGGESTION]: SuggestionLeaf,
    },
  }
);

export default function SuggestionApp() {
  const [, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setContainer} className="min-h-full">
      <PlateProvider plugins={plugins} initialValue={suggestionValue}>
        <SuggestionProvider>
          <HeadingToolbar>
            {/* <PlateSuggestionToolbarDropdown /> */}
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
        </SuggestionProvider>
      </PlateProvider>
    </div>
  );
}
