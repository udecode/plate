import React from 'react';
import { createLinkPlugin, Plate, PlateProvider } from '@udecode/plate';

import { HeadingToolbar } from '@/plate/aui/heading-toolbar';
import { LinkToolbarButton } from '@/plate/bcomponents/link-toolbar-button';
import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { linkPlugin } from '@/plate/demo/plugins/linkPlugin';
import { linkValue } from '@/plate/demo/values/linkValue';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createLinkPlugin(linkPlugin)],
  {
    components: plateUI,
  }
);

export default function LinkApp() {
  return (
    <PlateProvider<MyValue> plugins={plugins} initialValue={linkValue}>
      <HeadingToolbar>
        <LinkToolbarButton />
      </HeadingToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
