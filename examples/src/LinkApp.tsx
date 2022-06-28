import React from 'react';
import { Link } from '@styled-icons/material/Link';
import {
  createLinkPlugin,
  createPlateUI,
  HeadingToolbar,
  LinkToolbarButton,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { linkValue } from './link/linkValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins([...basicNodesPlugins, createLinkPlugin()], {
  components: createPlateUI(),
});

export default () => (
  <>
    <HeadingToolbar>
      <LinkToolbarButton icon={<Link />} />
    </HeadingToolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={linkValue}
    />
  </>
);
