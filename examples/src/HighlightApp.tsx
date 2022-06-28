import React from 'react';
import {
  createHighlightPlugin,
  createPlateUI,
  HeadingToolbar,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { HighlightToolbarButton } from './highlight/HighlightToolbarButton';
import { highlightValue } from './highlight/highlightValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createHighlightPlugin()],
  {
    components: createPlateUI(),
  }
);

export default () => (
  <>
    <HeadingToolbar>
      <HighlightToolbarButton />
    </HeadingToolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={highlightValue}
    />
  </>
);
