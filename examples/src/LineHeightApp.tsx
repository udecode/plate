import React from 'react';
import {
  createLineHeightPlugin,
  LineHeightToolbarDropdown,
  Plate,
  PlateProvider,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { Icons } from './common/icons';
import { plateUI } from './common/plateUI';
import { lineHeightPlugin } from './line-height/lineHeightPlugin';
import { lineHeightValue } from './line-height/lineHeightValue';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createLineHeightPlugin(lineHeightPlugin)],
  {
    components: plateUI,
  }
);

export default function LineHeightApp() {
  return (
    <PlateProvider<MyValue> plugins={plugins} initialValue={lineHeightValue}>
      <Toolbar>
        <LineHeightToolbarDropdown icon={<Icons.lineHeight />} />
      </Toolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
