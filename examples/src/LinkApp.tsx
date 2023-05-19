import React from 'react';
import {
  createLinkPlugin,
  LinkToolbarButton,
  Plate,
  PlateProvider,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { Icons } from './common/icons';
import { plateUI } from './common/plateUI';
import { linkPlugin } from './link/linkPlugin';
import { linkValue } from './link/linkValue';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createLinkPlugin(linkPlugin)],
  {
    components: plateUI,
  }
);

export default function LinkApp() {
  return (
    <PlateProvider<MyValue> plugins={plugins} initialValue={linkValue}>
      <Toolbar>
        <LinkToolbarButton icon={<Icons.link />} />
      </Toolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
