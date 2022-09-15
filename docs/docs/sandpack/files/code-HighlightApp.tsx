export const highlightAppCode = `import React from 'react';
import { createHighlightPlugin, Plate, PlateProvider } from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { HighlightToolbarButton } from './highlight/HighlightToolbarButton';
import { highlightValue } from './highlight/highlightValue';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createHighlightPlugin()],
  {
    components: plateUI,
  }
);

export default () => (
  <PlateProvider<MyValue> initialValue={highlightValue} plugins={plugins}>
    <Toolbar>
      <HighlightToolbarButton />
    </Toolbar>

    <Plate<MyValue> editableProps={editableProps} />
  </PlateProvider>
);
`;

export const highlightAppFile = {
  '/HighlightApp.tsx': highlightAppCode,
};
