export const placeholderAppCode = `import React from 'react';
import { createExitBreakPlugin, Plate } from '@udecode/plate';
import { BasicElementToolbarButtons } from './basic-elements/BasicElementToolbarButtons';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { exitBreakPlugin } from './exit-break/exitBreakPlugin';
import { placeholderValue } from './placeholder/placeholderValue';
import { withStyledPlaceHolders } from './placeholder/withStyledPlaceHolders';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const components = withStyledPlaceHolders(plateUI);

const plugins = createMyPlugins(
  [...basicNodesPlugins, createExitBreakPlugin(exitBreakPlugin)],
  {
    components,
  }
);

export default () => (
  <>
    <Toolbar>
      <BasicElementToolbarButtons />
    </Toolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={placeholderValue}
    />
  </>
);
`;

export const placeholderAppFile = {
  '/PlaceholderApp.tsx': placeholderAppCode,
};
