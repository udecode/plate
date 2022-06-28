import React from 'react';
import { createIndentPlugin, Plate } from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { indentPlugin } from './indent/indentPlugin';
import { IndentToolbarButtons } from './indent/IndentToolbarButtons';
import { indentValue } from './indent/indentValue';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createIndentPlugin(indentPlugin)],
  {
    components: plateUI,
  }
);

export default () => (
  <>
    <Toolbar>
      <IndentToolbarButtons />
    </Toolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={indentValue}
    />
  </>
);
