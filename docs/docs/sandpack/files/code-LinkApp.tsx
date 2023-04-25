export const linkAppCode = `import React from 'react';
import { Link } from '@styled-icons/material/Link';
import {
  createLinkPlugin,
  LinkToolbarButton,
  Plate,
  PlateProvider,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
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


export default () => (
  <PlateProvider<MyValue> plugins={plugins} initialValue={linkValue}>
    <Toolbar>
      <LinkToolbarButton icon={<Link />} />
    </Toolbar>

    <Plate<MyValue> editableProps={editableProps} />
  </PlateProvider>
);
`;

export const linkAppFile = {
  '/LinkApp.tsx': linkAppCode,
};
