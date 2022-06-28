import React from 'react';
import { createHighlightPlugin, Plate } from '@udecode/plate';
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
  <>
    <Toolbar>
      <HighlightToolbarButton />
    </Toolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={highlightValue}
    />
  </>
);
