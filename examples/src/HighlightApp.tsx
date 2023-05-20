import React from 'react';
import { createHighlightPlugin, Plate, PlateProvider } from '@udecode/plate';
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { HighlightToolbarButton } from './highlight/HighlightToolbarButton';
import { highlightValue } from './highlight/highlightValue';
import { Toolbar } from './toolbar/Toolbar';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createHighlightPlugin()],
  {
    components: plateUI,
  }
);

export default function HighlightApp() {
  return (
    <PlateProvider<MyValue> initialValue={highlightValue} plugins={plugins}>
      <Toolbar>
        <HighlightToolbarButton />
      </Toolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
