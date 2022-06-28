import React from 'react';
import {
  createExitBreakPlugin,
  createPlateUI,
  HeadingToolbar,
  Plate,
} from '@udecode/plate';
import { BasicElementToolbarButtons } from './basic-elements/BasicElementToolbarButtons';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { exitBreakPlugin } from './exit-break/exitBreakPlugin';
import { placeholderValue } from './placeholder/placeholderValue';
import { withStyledPlaceHolders } from './placeholder/withStyledPlaceHolders';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const components = withStyledPlaceHolders(createPlateUI());

const plugins = createMyPlugins(
  [...basicNodesPlugins, createExitBreakPlugin(exitBreakPlugin)],
  {
    components,
  }
);

export default () => (
  <>
    <HeadingToolbar>
      <BasicElementToolbarButtons />
    </HeadingToolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={placeholderValue}
    />
  </>
);
