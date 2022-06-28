import React from 'react';
import {
  createIndentPlugin,
  createPlateUI,
  HeadingToolbar,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { indentPlugin } from './indent/indentPlugin';
import { IndentToolbarButtons } from './indent/IndentToolbarButtons';
import { indentValue } from './indent/indentValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createIndentPlugin(indentPlugin)],
  {
    components: createPlateUI(),
  }
);

export default () => (
  <>
    <HeadingToolbar>
      <IndentToolbarButtons />
    </HeadingToolbar>
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={indentValue}
    />
  </>
);
