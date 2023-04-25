export const suggestionAppCode = `import React from 'react';
import {
  createSuggestionPlugin,
  MARK_SUGGESTION,
  Plate,
  PlateProvider,
  PlateSuggestionLeaf,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { suggestionValue } from './suggestion/constants';
import { MySuggestionProvider } from './suggestion/MySuggestionsProvider';
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
  return (
    <PlateProvider plugins={plugins} initialValue={suggestionValue}>
      <MySuggestionProvider>
        <Toolbar>
          <PlateSuggestionToolbarDropdown />
        </Toolbar>

        <Plate<MyValue> editableProps={editableProps} />
      </MySuggestionProvider>
    </PlateProvider>
  );
};
`;

export const suggestionAppFile = {
  '/SuggestionApp.tsx': suggestionAppCode,
};
