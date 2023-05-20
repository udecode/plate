import React from 'react';
import { createIndentPlugin, Plate, PlateProvider } from '@udecode/plate';
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { indentPlugin } from './indent/indentPlugin';
import { IndentToolbarButtons } from './indent/IndentToolbarButtons';
import { indentValue } from './indent/indentValue';
import { Toolbar } from './toolbar/Toolbar';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createIndentPlugin(indentPlugin)],
  {
    components: plateUI,
  }
);

export default function IndentApp() {
  return (
    <PlateProvider<MyValue> initialValue={indentValue} plugins={plugins}>
      <Toolbar>
        <IndentToolbarButtons />
      </Toolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
