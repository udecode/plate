import React from 'react';
import { createExitBreakPlugin, Plate } from '@udecode/plate';
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { BasicElementToolbarButtons } from './basic-elements/BasicElementToolbarButtons';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { exitBreakPlugin } from './exit-break/exitBreakPlugin';
import { placeholderValue } from './placeholder/placeholderValue';
import { withStyledPlaceHolders } from './placeholder/withStyledPlaceHolders';
import { Toolbar } from './toolbar/Toolbar';

const components = withStyledPlaceHolders(plateUI);

const plugins = createMyPlugins(
  [...basicNodesPlugins, createExitBreakPlugin(exitBreakPlugin)],
  {
    components,
  }
);

export default function PlaceholderApp() {
  return (
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
}
