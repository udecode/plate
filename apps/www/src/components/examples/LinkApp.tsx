import React from 'react';
import { createLinkPlugin, Plate, PlateProvider } from '@udecode/plate';

import { Icons } from '@/components/icons';
import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { linkPlugin } from '@/plate/link/linkPlugin';
import { LinkToolbarButton } from '@/plate/link/LinkToolbarButton';
import { linkValue } from '@/plate/link/linkValue';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

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
