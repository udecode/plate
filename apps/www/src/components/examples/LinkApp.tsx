import React from 'react';
import { createLinkPlugin, Plate, PlateProvider } from '@udecode/plate';

import { Icons } from '@/components/icons';
import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { linkPlugin } from '@/plate/demo/plugins/linkPlugin';
import { linkValue } from '@/plate/demo/values/linkValue';
import { LinkToolbarButton } from '@/plate/link/LinkToolbarButton';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';

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
        <LinkToolbarButton>
          <Icons.link />
        </LinkToolbarButton>
      </HeadingToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
