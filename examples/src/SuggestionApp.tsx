import React, { useState } from 'react';
import {
  createSuggestionPlugin,
  MARK_SUGGESTION,
  Plate,
  PlateProvider,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { suggestionValue } from './suggestion/constants';
import { MySuggestionProvider } from './suggestion/MySuggestionsProvider';
import { PlateFloatingSuggestions } from './suggestion/PlateFloatingSuggestions';
import { PlateSuggestionLeaf } from './suggestion/PlateSuggestionLeaf';
import { PlateSuggestionToolbarDropdown } from './suggestion/PlateSuggestionToolbarDropdown';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createSuggestionPlugin()],
  {
    components: {
      ...plateUI,
      [MARK_SUGGESTION]: PlateSuggestionLeaf,
    },
  }
);

export default () => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setContainer} className="min-h-full">
      <PlateProvider plugins={plugins} initialValue={suggestionValue}>
        <MySuggestionProvider>
          <Toolbar>
            <PlateSuggestionToolbarDropdown />
          </Toolbar>

          <Plate<MyValue> editableProps={editableProps}>
            <PlateFloatingSuggestions
              popoverProps={{
                contentProps: {
                  collisionBoundary: container,
                  collisionPadding: 8,
                },
              }}
            />
          </Plate>
        </MySuggestionProvider>
      </PlateProvider>
    </div>
  );
};
